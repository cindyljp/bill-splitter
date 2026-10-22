/* Free, on-device receipt scanner. No receipt image is sent to an application server. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const money=n=>'RM '+Number(n||0).toFixed(2);
let file=null,previewURL=null,rotation=0,working=false,rows=[],ocrLines=[],expected={},recognized='',engine=null;
const controls=['receipt-camera','receipt-upload','receipt-rotate','receipt-scan'];
const status=(message)=>{$('receipt-status').textContent=message};
const amount=s=>{
 const m=String(s).replace(/[,\s]/g,'').match(/(?:RM|MYR)?(-?\d{1,6}\.\d{2})\b/i);
 return m?Number(m[1]):null;
};
const skip=/^(?:sub\s*total|total|grand\s*total|amount\s*due|balance|change|cash|credit|debit|visa|master|card|payment|paid|tax|sst|gst|service(?:\s*(?:charge|tax))?|round(?:ing)?|discount|voucher|receipt|invoice|table|order|bill\s*no|date|time|tel|phone|address|thank|welcome|net\s*total|dine\s*in|takeaway|no\.|qty\s+item)/i;
const taxLine=/\b(?:SST|GST|service\s*charge|service\s*tax|rounding|round\s*off|discount|subtotal|grand\s*total|total\s*due|total\s*amount)\b/i;
function parseReceipt(lines){
 const detected=[],totals={};
 for(const line of lines){
  const raw=line.text.trim().replace(/\s+/g,' ');
  if(!raw)continue;
  const value=amount(raw);
  if(value===null)continue;
  if(/\b(?:grand\s*total|total\s*due|total\s*amount|net\s*total|amount\s*due)\b|^total\b/i.test(raw))totals.total=value;
  else if(/\bsub\s*total\b/i.test(raw))totals.subtotal=value;
  else if(/\b(?:SST|GST|service\s*tax)\b/i.test(raw))totals.sst=value;
  else if(/\bservice\s*charge\b/i.test(raw))totals.service=value;
  else if(/\bround(?:ing|\s*off)\b/i.test(raw))totals.rounding=value;
  if(skip.test(raw)||taxLine.test(raw)||/\b(?:RM|MYR)\s*\d+\.\d{2}\s*$/i.test(raw)&&!/[a-z]{2,}/i.test(raw.replace(/RM|MYR/ig,'')))continue;
  // Final price is usually rightmost. OCR positions are preserved in each line.
  const prices=[...raw.matchAll(/(?:RM\s*)?\d{1,6}[.,]\d{2}\b/gi)];
  if(!prices.length)continue;
  const last=prices[prices.length-1],total=Number(last[0].replace(/RM\s*/i,'').replace(',','.'));
  if(!Number.isFinite(total)||total<0||total>100000)continue;
  let name=raw.slice(0,last.index).replace(/\bRM\s*$/i,'').trim();
  let qty=1,unit=total;
  const prefix=name.match(/^\s*(\d{1,3})\s*[xX×*]\s*(.+)$/);
  if(prefix){qty=Number(prefix[1]);name=prefix[2]}
  const suffix=name.match(/^(.+?)\s+[xX×*]\s*(\d{1,3})$/);
  if(suffix){name=suffix[1];qty=Number(suffix[2])}
  const priceInName=name.match(/(?:RM\s*)?(\d{1,5}[.,]\d{2})\s*[xX×*]\s*(\d{1,3})\s*$/i);
  if(priceInName){unit=Number(priceInName[1].replace(',','.'));qty=Number(priceInName[2]);name=name.slice(0,priceInName.index).trim()}
  else if(qty>1)unit=total/qty;
  if(!/[a-zA-Z\u00c0-\u024f\u4e00-\u9fff]/.test(name)||qty<1||qty>100)continue;
  name=name.replace(/^[#*\-\s]+/,'').replace(/[.\-\s]+$/,'').trim();
  if(name.length<2)continue;
  detected.push({name,qty,price:Number(unit.toFixed(2)),selected:true,confidence:line.confidence??null});
 }
 return {items:detected,totals};
}
function groupWords(data){
 const blockWords=(data?.blocks||[]).flatMap(b=>(b.paragraphs||[]).flatMap(p=>(p.lines||[]).flatMap(l=>l.words||[])));
 const words=(data?.words?.length?data.words:blockWords).filter(w=>w.text?.trim()).map(w=>({text:w.text.trim(),box:w.bbox||{},confidence:w.confidence}));
 if(!words.length)return (data?.lines?.length?data.lines:(data?.text||'').split(/\r?\n/).map(text=>({text}))).map(l=>({text:l.text,confidence:l.confidence}));
 const sorted=words.sort((a,b)=>(a.box.y0??0)-(b.box.y0??0)||(a.box.x0??0)-(b.box.x0??0));
 const grouped=[];
 for(const word of sorted){
  const mid=((word.box.y0??0)+(word.box.y1??0))/2,h=Math.max(8,(word.box.y1??0)-(word.box.y0??0));
  let row=grouped.find(r=>Math.abs(r.mid-mid)<Math.max(8,Math.min(r.h,h)*.55));
  if(!row){row={mid,h,words:[]};grouped.push(row)}
  row.words.push(word);
 }
 return grouped.sort((a,b)=>a.mid-b.mid).map(r=>({text:r.words.sort((a,b)=>(a.box.x0??0)-(b.box.x0??0)).map(w=>w.text).join(' '),confidence:r.words.reduce((n,w)=>n+(w.confidence||0),0)/r.words.length}));
}
function imageCanvas(image,angle,threshold=false){
 const radians=angle*Math.PI/180,sw=image.naturalWidth,sh=image.naturalHeight;
 const max=1800,scale=Math.min(1,max/Math.max(sw,sh));
 const w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));
 const canvas=document.createElement('canvas');
 canvas.width=angle%180===0?w:h;canvas.height=angle%180===0?h:w;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(radians);ctx.drawImage(image,-w/2,-h/2,w,h);ctx.setTransform(1,0,0,1,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data;
 // Grayscale + gentle contrast boost; threshold variant is a fallback for faint thermal receipts.
 for(let i=0;i<d.length;i+=4){
  let lum=.299*d[i]+.587*d[i+1]+.114*d[i+2];
  lum=Math.max(0,Math.min(255,(lum-128)*1.35+145));
  if(threshold)lum=lum>155?255:0;
  d[i]=d[i+1]=d[i+2]=lum;
 }
 ctx.putImageData(pixels,0,0);return canvas;
}
function setBusy(value){
 working=value;for(const id of controls)$(id).disabled=value;
 $('receipt-remove').disabled=value;$('receipt-import').disabled=value;
}
function setFile(next){
 if(!next)return;
 if(!next.type.startsWith('image/')){status('Please select a receipt image.');return}
 if(next.size>20*1024*1024){status('Image is too large. Please use an image under 20 MB.');return}
 if(previewURL)URL.revokeObjectURL(previewURL);
 file=next;rotation=0;previewURL=URL.createObjectURL(file);
 $('receipt-preview').src=previewURL;$('receipt-preview').style.transform='rotate(0deg)';
 $('receipt-preview-wrap').hidden=false;$('receipt-review').hidden=true;rows=[];expected={};recognized='';
 status('Image ready. Select Scan receipt to detect items.');
}
function render(){
 const target=$('receipt-rows');target.replaceChildren();
 rows.forEach((item,index)=>{
  const wrap=document.createElement('div');wrap.className='receipt-row';
  const check=document.createElement('input');check.type='checkbox';check.checked=item.selected;check.setAttribute('aria-label','Import item '+(index+1));check.onchange=()=>{item.selected=check.checked;validate()};
  const name=document.createElement('input');name.className='input';name.value=item.name;name.setAttribute('aria-label','Item '+(index+1)+' name');name.oninput=()=>{item.name=name.value;validate()};
  const qty=document.createElement('input');qty.className='input';qty.type='number';qty.min='1';qty.step='1';qty.value=item.qty;qty.setAttribute('aria-label','Item '+(index+1)+' quantity');qty.oninput=()=>{item.qty=Number(qty.value);validate()};
  const price=document.createElement('input');price.className='input';price.type='number';price.min='0';price.step='0.01';price.value=item.price;price.setAttribute('aria-label','Item '+(index+1)+' unit price');price.oninput=()=>{item.price=Number(price.value);validate()};
  const del=document.createElement('button');del.type='button';del.className='receipt-del';del.textContent='×';del.setAttribute('aria-label','Remove detected item '+(index+1));del.onclick=()=>{rows.splice(index,1);render()};
  wrap.append(check,name,qty,price,del);target.append(wrap);
 });
 validate();
}
function validate(){
 const chosen=rows.filter(x=>x.selected);
 $('receipt-import').disabled=working||!chosen.length||chosen.some(x=>!x.name.trim()||!Number.isFinite(x.qty)||x.qty<=0||!Number.isInteger(x.qty)||!Number.isFinite(x.price)||x.price<0);
}
async function scanner(){
 if(window.Tesseract)return window.Tesseract;
 status('Downloading free OCR engine and language data (first scan only)…');
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  script.onload=resolve;script.onerror=()=>reject(new Error('OCR library could not load. Check your connection.'));
  document.head.append(script);
 });
 if(!window.Tesseract)throw Error('OCR library unavailable');
 return window.Tesseract;
}
async function recognize(canvas,mode){
 const t=await scanner();
 const worker=await t.createWorker('eng',1,{logger:m=>{if(m.status==='recognizing text')status('Recognizing receipt text… '+Math.round((m.progress||0)*100)+'%')}});
 try{
  if(mode===1)await worker.setParameters({tessedit_pageseg_mode:'6'});
  // Explicit output formats ensure coordinates are available for layout-aware parsing.
  const result=await worker.recognize(canvas,{}, {text:true,blocks:true});
  return {text:result.data.text||'',lines:groupWords(result.data),confidence:result.data.confidence||0};
 }finally{await worker.terminate()}
}
async function scan(){
 if(!file||working)return;setBusy(true);
 try{
  const image=new Image();image.src=previewURL;await image.decode();
  const first=await recognize(imageCanvas(image,rotation),0);
  let best=first,parsed=parseReceipt(first.lines);
  // Fallback: threshold preprocessing + single text block layout when the first pass is weak.
  if(parsed.items.length===0||first.confidence<40){
   status('Trying enhanced recognition for a faint or unusual receipt…');
   try{
    const second=await recognize(imageCanvas(image,rotation,true),1);
    const candidate=parseReceipt(second.lines);
    if(candidate.items.length>parsed.items.length||(candidate.items.length===parsed.items.length&&second.confidence>best.confidence)){best=second;parsed=candidate}
   }catch(err){console.warn('Enhanced OCR fallback unavailable',err)}
  }
  recognized=best.text;ocrLines=best.lines;rows=parsed.items;expected=parsed.totals;
  $('receipt-review').hidden=false;render();
  status(rows.length?'Found '+rows.length+' possible items. Review and correct them before importing.':'No clear items detected. Edit the OCR text or add rows manually.');
 }catch(err){console.error(err);status('Could not scan: '+(err.message||String(err))+'. Try a clearer photo or enter items manually.');$('receipt-review').hidden=false;render()}
 finally{setBusy(false);validate()}
}
$('receipt-camera').onclick=()=>$('receipt-camera-file').click();
$('receipt-upload').onclick=()=>$('receipt-upload-file').click();
for(const id of ['receipt-camera-file','receipt-upload-file'])$(id).addEventListener('change',e=>{setFile(e.target.files?.[0]);e.target.value=''});
const dropzone=$('receipt-dropzone');
let dragDepth=0;
const imageFromFiles=files=>Array.from(files||[]).find(f=>f.type?.startsWith('image/'));
dropzone.addEventListener('dragenter',event=>{if(!event.dataTransfer?.types?.includes('Files'))return;event.preventDefault();dragDepth++;dropzone.classList.add('is-dragging')});
dropzone.addEventListener('dragover',event=>{if(!event.dataTransfer?.types?.includes('Files'))return;event.preventDefault();event.dataTransfer.dropEffect='copy'});
dropzone.addEventListener('dragleave',event=>{event.preventDefault();dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)dropzone.classList.remove('is-dragging')});
dropzone.addEventListener('drop',event=>{event.preventDefault();dragDepth=0;dropzone.classList.remove('is-dragging');if(working)return;const image=imageFromFiles(event.dataTransfer?.files);if(image)setFile(image);else status('Please drop an image file.')});
document.addEventListener('paste',event=>{
 if(working)return;
 const target=event.target;
 if(target instanceof HTMLElement&&(target.isContentEditable||['INPUT','TEXTAREA'].includes(target.tagName)))return;
 const image=imageFromFiles(event.clipboardData?.files)||Array.from(event.clipboardData?.items||[]).find(item=>item.type.startsWith('image/'))?.getAsFile();
 if(!image)return;
 event.preventDefault();setFile(image);
});
$('receipt-rotate').onclick=()=>{rotation=(rotation+90)%360;$('receipt-preview').style.transform='rotate('+rotation+'deg)';status('Rotated preview. Scan again to apply the rotation.')};
$('receipt-scan').onclick=scan;
const removeDialog=$('receipt-remove-dialog');
const closeRemoveDialog=()=>removeDialog.close();
$('receipt-remove').onclick=()=>{if(!working&&file)removeDialog.showModal()};
$('receipt-remove-cancel').onclick=closeRemoveDialog;
removeDialog.addEventListener('click',event=>{if(event.target===removeDialog)closeRemoveDialog()});
$('receipt-remove-confirm').onclick=()=>{
 if(working)return;
 if(previewURL)URL.revokeObjectURL(previewURL);
 previewURL=null;file=null;rows=[];ocrLines=[];recognized='';expected={};
 $('receipt-preview').removeAttribute('src');
 $('receipt-preview-wrap').hidden=true;$('receipt-review').hidden=true;
 closeRemoveDialog();
 status('Receipt image removed. Existing bill items are unchanged.');
};
$('receipt-add-row').onclick=()=>{rows.push({name:'',qty:1,price:0,selected:true});render()};
$('receipt-import').onclick=()=>{
 const chosen=rows.filter(x=>x.selected);if(!chosen.length)return;
 const valid=chosen.every(x=>x.name.trim()&&Number.isInteger(x.qty)&&x.qty>0&&Number.isFinite(x.price)&&x.price>=0);
 if(!valid){status('Check item names, quantities, and prices before importing.');return}
 const unassigned=Object.values(expected).length>0&&expected.subtotal!=null&&Math.abs(chosen.reduce((n,x)=>n+x.qty*x.price,0)-expected.subtotal)>.03;
 if(unassigned&&!confirm('The selected item subtotal does not match the receipt subtotal. Import anyway?'))return;
 window.dispatchEvent(new CustomEvent('bill-splitter:receipt-import',{detail:{items:chosen.map(x=>({name:x.name.trim(),qty:x.qty,price:x.price}))}}));
 $('receipt-review').hidden=true;rows=[];status('Items imported. Select who shared each item.');
};
})();