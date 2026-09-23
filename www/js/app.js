(function(){
"use strict";
"use strict";
var CATS=["Antibiotics","Pain & fever","Malaria","Stomach","Allergy","Vitamins","Chronic care","Other"];
var FORMS=["Tablets","Capsules","Syrup","Suspension","Injection","Cream or ointment","Drops","Inhaler","Sachet","Other"];
var PAY=["Cash","Transfer","POS"];
var KEY="ag-pharmacy-price-book-demo-v3";
var SKEY="ag-pharmacy-price-book-sales-v1";
var CKEY="ag-pharmacy-price-book-settings-v2";
var OKEY="ag-pharmacy-price-book-onboarded-v1";
var DAY=864e5;
var uid=1;
function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})}
function naira(n){return "\u20A6"+Number(n).toLocaleString("en-NG")}
function ago(d){return new Date(Date.now()-d*DAY).toISOString()}
function nid(){return "m"+Date.now().toString(36)+(uid++)}
function fmtDate(i){try{return new Date(i).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}catch(e){return ""}}
function fmtDT(i){try{return new Date(i).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit",hour12:true})}catch(e){return ""}}
function money(s){var n=Number(String(s||"").replace(/[^0-9.]/g,""));return isFinite(n)&&n>0?Math.round(n):0}
function pad(n,l){var s=String(n);while(s.length<l)s="0"+s;return s}
function parseDay(s){var p=String(s).split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function today0(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
function daysLeft(exp){return Math.round((parseDay(exp)-today0())/DAY)}
function dstr(days){var d=new Date();d.setDate(d.getDate()+days);return d.getFullYear()+"-"+pad(d.getMonth()+1,2)+"-"+pad(d.getDate(),2)}
function expLevel(d){return d<=30?"bad":d<=90?"warn":"ok"}
function expText(d){
  if(d<0)return "Expired "+(-d)+(d===-1?" day":" days")+" ago";
  if(d===0)return "Expires today";
  if(d===1)return "Expires tomorrow";
  if(d<=120)return "Expires in "+d+" days";
  return "Expires in "+Math.round(d/30)+" months";
}
function copyText(t,msg){
  function fb(){try{var ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();var ok=document.execCommand("copy");document.body.removeChild(ta);toast(ok?msg:"Could not copy here")}catch(e){toast("Could not copy here")}}
  try{navigator.clipboard.writeText(t).then(function(){toast(msg)},fb)}catch(e){fb()}
}
function shareOrCopy(text,filename,copiedMsg){
  if(window.AGBridge&&window.AGBridge.share){
    window.AGBridge.share(filename,text).then(function(){toast("Sent")}).catch(function(){copyText(text,copiedMsg)});
  }else if(navigator.share){
    navigator.share({title:filename,text:text}).then(function(){toast("Sent")}).catch(function(){});
  }else{
    copyText(text,copiedMsg);
  }
}

function mk(name,generic,brand,strength,form,pack,sell,buy,supplier,cat,age,older,notes){
  var hist=[{price:sell,date:ago(age)}].concat((older||[]).map(function(o){return{price:o[1],date:ago(o[0])}}));
  return{id:nid(),name:name,generic:generic,brand:brand,strength:strength,form:form,pack:pack,sell:sell,buy:buy,supplier:supplier,category:cat,notes:notes||"",updated:ago(age),history:hist,batches:[]};
}
function seedBase(){return[
  mk("Amoxicillin","Amoxicillin","Amoxil","500mg","Capsules","20 capsules",4500,3800,"Emzor Distributors","Antibiotics",3,[[40,4200],[95,3900]],"Keep below 25\u00B0C"),
  mk("Augmentin","Amoxicillin + clavulanate","Augmentin","625mg","Tablets","14 tablets",9800,8600,"GSK Depot","Antibiotics",12,[[70,9200]]),
  mk("Flagyl","Metronidazole","Flagyl","400mg","Tablets","21 tablets",1500,1150,"Emzor Distributors","Antibiotics",45,[[120,1300]]),
  mk("Ciprofloxacin","Ciprofloxacin","Ciprotab","500mg","Tablets","10 tablets",2800,2100,"Fidson Depot","Antibiotics",8),
  mk("Azithromycin","Azithromycin","Zithromax","500mg","Tablets","3 tablets",4200,3300,"Fidson Depot","Antibiotics",20),
  mk("Ampiclox","Ampicillin + cloxacillin","Ampiclox","500mg","Capsules","20 capsules",3600,2900,"Emzor Distributors","Antibiotics",33),
  mk("Cefuroxime","Cefuroxime","Zinnat","500mg","Tablets","10 tablets",7500,6200,"GSK Depot","Antibiotics",104,[[190,6800]]),
  mk("Paracetamol","Paracetamol","Panadol","500mg","Tablets","10 x 10 tablets",1800,1400,"Emzor Distributors","Pain & fever",2,[[35,1600]]),
  mk("Panadol Extra","Paracetamol + caffeine","Panadol Extra","500mg/65mg","Tablets","12 tablets",1200,900,"GSK Depot","Pain & fever",15),
  mk("Paracetamol syrup","Paracetamol","Calpol","120mg/5ml","Syrup","60ml bottle",1000,750,"Emzor Distributors","Pain & fever",33),
  mk("Ibuprofen","Ibuprofen","Brufen","400mg","Tablets","20 tablets",1400,1000,"Fidson Depot","Pain & fever",6),
  mk("Diclofenac","Diclofenac","Voltaren","50mg","Tablets","20 tablets",1300,950,"Fidson Depot","Pain & fever",118),
  mk("Coartem","Artemether + lumefantrine","Coartem","20mg/120mg","Tablets","24 tablets",3800,3000,"Novartis Depot","Malaria",5,[[60,3500]]),
  mk("Lonart DS","Artemether + lumefantrine","Lonart","80mg/480mg","Tablets","6 tablets",2600,2000,"Bliss GVS","Malaria",14),
  mk("Omeprazole","Omeprazole","Losec","20mg","Capsules","30 capsules",2500,1800,"Fidson Depot","Stomach",22),
  mk("Buscopan","Hyoscine butylbromide","Buscopan","10mg","Tablets","20 tablets",2400,1900,"Sanofi Depot","Stomach",60),
  mk("Loperamide","Loperamide","Imodium","2mg","Capsules","6 capsules",900,650,"Fidson Depot","Stomach",9),
  mk("Loratadine","Loratadine","Clarityn","10mg","Tablets","10 tablets",1100,800,"Emzor Distributors","Allergy",4),
  mk("Cetirizine","Cetirizine","Zyrtec","10mg","Tablets","10 tablets",800,550,"Emzor Distributors","Allergy",130),
  mk("Piriton","Chlorphenamine","Piriton","4mg","Tablets","30 tablets",700,500,"GSK Depot","Allergy",27),
  mk("Vitamin C","Ascorbic acid","","500mg","Tablets","100 chewable tablets",3500,2700,"Bliss GVS","Vitamins",18),
  mk("Folic acid","Folic acid","","5mg","Tablets","28 tablets",700,450,"Fidson Depot","Vitamins",50),
  mk("Zinc sulphate","Zinc sulphate","","20mg","Tablets","10 dispersible tablets",1500,1050,"Emzor Distributors","Vitamins",11),
  mk("Metformin","Metformin","Glucophage","500mg","Tablets","30 tablets",1800,1300,"Fidson Depot","Chronic care",7),
  mk("Amlodipine","Amlodipine","Norvasc","5mg","Tablets","30 tablets",2200,1600,"Fidson Depot","Chronic care",16),
  mk("Glibenclamide","Glibenclamide","Daonil","5mg","Tablets","30 tablets",1500,1100,"Sanofi Depot","Chronic care",75),
  mk("Fluconazole","Fluconazole","Diflucan","150mg","Capsules","1 capsule",1200,850,"Fidson Depot","Other",25),
  mk("Ventolin","Salbutamol","Ventolin","100mcg","Inhaler","200 doses",4800,3900,"GSK Depot","Other",19)
]}
var BT={
  "Amoxicillin":[[24,"AMX-2409",30],[210,"AMX-2503",60]],
  "Augmentin":[[-6,"AUG-2312",5],[300,"AUG-2601",20]],
  "Flagyl":[[75,"FLG-1187",40]],
  "Ciprofloxacin":[[140,"CIP-771",25]],
  "Azithromycin":[[52,"AZI-903",12]],
  "Ampiclox":[[18,"AMP-455",22]],
  "Cefuroxime":[[-19,"CEF-220",8]],
  "Paracetamol":[[400,"PCM-5510",100]],
  "Panadol Extra":[[88,"PEX-3308",36]],
  "Paracetamol syrup":[[9,"PSY-118",14]],
  "Ibuprofen":[[260,"IBU-902",50]],
  "Diclofenac":[[33,"DIC-651",30]],
  "Coartem":[[180,"COA-7734",40]],
  "Lonart DS":[[63,"LON-410",18]],
  "Omeprazole":[[95,"OME-208",45]],
  "Buscopan":[[27,"BUS-337",20]],
  "Loperamide":[[350,"LOP-914",30]],
  "Loratadine":[[120,"LOR-562",35]],
  "Cetirizine":[[-40,"CET-118",10]],
  "Piriton":[[44,"PIR-806",60]],
  "Vitamin C":[[210,"VTC-292",25]],
  "Folic acid":[[15,"FOL-774",40]],
  "Zinc sulphate":[[160,"ZNC-505",30]],
  "Metformin":[[280,"MET-618",60]],
  "Amlodipine":[[330,"AML-921",45]],
  "Glibenclamide":[[58,"GLB-343",30]],
  "Fluconazole":[[70,"FLC-186",15]],
  "Ventolin":[[140,"VEN-247",6]]
};
function seed(){
  var list=seedBase();
  list.forEach(function(m){m.batches=(BT[m.name]||[]).map(function(x){return{id:nid(),no:x[1],expiry:dstr(x[0]),qty:x[2]}})});
  return list;
}

function loadJSON(k){try{var r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(e){return null}}
function saveJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var DEFAULT_SETTINGS={name:"Pharmacy Price Book",address:"Shop address, Abuja",phone:"Phone number",footer:"Thank you. Get well soon."};
function blankSale(){return{cart:[],customer:"",payment:"Cash",disc:"",paid:"",more:false}}

var meds0=loadJSON(KEY);
var state={
  meds:(Array.isArray(meds0)&&meds0.length)?meds0:seed(),
  sales:[],settings:loadJSON(CKEY)||DEFAULT_SETTINGS,
  q:"",cat:"All",tab:"prices",offline:false,
  sheet:null,openId:null,receiptId:null,draft:null,errs:{},
  expWin:90,salesTab:"new",sale:blankSale()
};
function persist(){saveJSON(KEY,state.meds)}
function persistSales(){saveJSON(SKEY,state.sales)}

function seedSales(){
  function pickM(n){for(var i=0;i<state.meds.length;i++)if(state.meds[i].name===n)return state.meds[i];return null}
  function mkSale(no,daysAgo,hrs,cust,pay,lines,disc,paid){
    var items=[],sub=0;
    lines.forEach(function(l){var m=pickM(l[0]);if(!m)return;items.push({name:m.name,strength:m.strength,form:m.form,pack:m.pack,price:m.sell,qty:l[1]});sub+=m.sell*l[1]});
    if(!items.length)return null;
    var d=new Date(Date.now()-daysAgo*DAY);d.setHours(hrs,17,0,0);
    var total=sub-disc;
    return{id:nid(),no:"R-"+pad(no,4),date:d.toISOString(),customer:cust,payment:pay,items:items,subtotal:sub,discount:disc,total:total,paid:paid,change:paid>total?paid-total:0};
  }
  return[
    mkSale(3,0,9,"Mrs Adaeze Okafor","Cash",[["Paracetamol",2],["Vitamin C",1]],0,10000),
    mkSale(2,1,16,"Walk-in customer","Transfer",[["Coartem",1],["Amoxicillin",1]],300,0),
    mkSale(1,2,11,"Mr Ibrahim Musa","POS",[["Metformin",2]],0,0)
  ].filter(Boolean);
}
var salesStored=loadJSON(SKEY);
if(Array.isArray(salesStored)){state.sales=salesStored}else{state.sales=seedSales();persistSales()}

function findMed(id){for(var i=0;i<state.meds.length;i++)if(state.meds[i].id===id)return state.meds[i];return null}
function findSale(id){for(var i=0;i<state.sales.length;i++)if(state.sales[i].id===id)return state.sales[i];return null}
function ageDays(m){return Math.max(0,Math.floor((Date.now()-new Date(m.updated).getTime())/DAY))}
function level(d){return d>=90?"bad":d>=30?"warn":"ok"}
function ageText(d){
  if(d<1)return "Updated today";
  if(d===1)return "Updated yesterday";
  if(d<90)return "Updated "+d+" days ago";
  return "Needs review, "+Math.round(d/30)+" months old";
}
function earliest(m){
  var e=null;
  (m.batches||[]).forEach(function(b){if(!b.expiry)return;var d=daysLeft(b.expiry);if(e===null||d<e)e=d});
  return e;
}

function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function dist(a,b){
  var m=a.length,n=b.length,i,j,p=[],c;
  for(j=0;j<=n;j++)p[j]=j;
  for(i=1;i<=m;i++){
    var prev=p[0];p[0]=i;
    for(j=1;j<=n;j++){
      c=p[j];
      p[j]=Math.min(p[j]+1,p[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=c;
    }
  }
  return p[n];
}
function words(s){return norm(s).split(/[^a-z0-9.]+/).filter(Boolean)}
function score(m,toks){
  var nameW=words(m.name),all=words([m.name,m.generic,m.brand,m.strength,m.form,m.category].join(" ")),total=0;
  for(var t=0;t<toks.length;t++){
    var tk=toks[t],best=0;
    for(var i=0;i<all.length;i++){
      var w=all[i];
      if(w.indexOf(tk)===0){best=Math.max(best,nameW.indexOf(w)>-1?5:3)}
      else if(tk.length>=3&&w.indexOf(tk)>-1){best=Math.max(best,1)}
      else if(tk.length>=4&&dist(tk,w.slice(0,tk.length))<=1){best=Math.max(best,2)}
    }
    if(!best)return 0;
    total+=best;
  }
  return total;
}
function search(q,base){
  var toks=norm(q).trim().split(/\s+/);
  return base.map(function(m){return{m:m,s:score(m,toks)}}).filter(function(x){return x.s>0})
    .sort(function(a,b){return b.s-a.s||a.m.name.localeCompare(b.m.name)}).map(function(x){return x.m});
}
function filtered(){
  var list=state.meds.filter(function(m){
    if(state.cat==="All")return true;
    if(state.cat==="review")return ageDays(m)>=90;
    return m.category===state.cat;
  });
  if(norm(state.q).trim())return search(state.q,list);
  return list.sort(function(a,b){return a.name.localeCompare(b.name)});
}

/* ---------- Header ---------- */
function renderHeader(){
  $("#appTitle").textContent=state.settings.name||DEFAULT_SETTINGS.name;
  try{document.title=state.settings.name||DEFAULT_SETTINGS.name}catch(e){}
}

/* ---------- Prices tab ---------- */
function renderCount(){$("#count").textContent=state.meds.length+" medicines saved on this device"}
function renderChips(){
  var review=state.meds.filter(function(m){return ageDays(m)>=90}).length;
  var items=[["All","All"]];
  if(review)items.push(["review","Needs review ("+review+")"]);
  CATS.forEach(function(c){items.push([c,c])});
  $("#chips").innerHTML=items.map(function(it){
    return '<button class="chip" data-action="chip" data-cat="'+esc(it[0])+'" aria-pressed="'+(state.cat===it[0])+'">'+esc(it[1])+"</button>";
  }).join("");
}
function ticket(m){
  var d=ageDays(m),lv=level(d),line=[m.form,m.pack].filter(Boolean).join(", ");
  var gen=m.generic&&norm(m.generic)!==norm(m.name)?'<div class="meta">'+esc(m.generic)+"</div>":"";
  var ed=earliest(m),expLine=(ed!==null&&ed<=90)?'<div class="exp '+expLevel(ed)+'">'+esc(expText(ed))+"</div>":"";
  return '<li><button class="ticket '+lv+'" data-action="open" data-id="'+esc(m.id)+'">'+
    '<div class="tk-main"><div class="nm">'+esc(m.name)+' <span class="st">'+esc(m.strength)+"</span></div>"+
    '<div class="meta">'+esc(line)+"</div>"+gen+
    '<div class="age">'+esc(ageText(d))+"</div>"+expLine+"</div>"+
    '<div class="tk-price"><span class="cur">\u20A6</span><span class="amt">'+Number(m.sell).toLocaleString("en-NG")+"</span></div></button></li>";
}
function renderResults(){
  var list=filtered(),q=state.q.trim();
  $("#info").textContent=(q||state.cat!=="All")?(list.length+(list.length===1?" result":" results")):"";
  if(!list.length){
    $("#results").innerHTML='<li class="empty"><p>'+(q?'No medicine matches "'+esc(q)+'".':"Nothing in this group yet.")+'</p><button class="primary" data-action="add">Add '+(q?esc(q):"a medicine")+"</button></li>";
    return;
  }
  $("#results").innerHTML=list.map(ticket).join("");
}
function renderTabs(){
  var n=0;
  state.meds.forEach(function(m){(m.batches||[]).forEach(function(b){if(b.expiry&&daysLeft(b.expiry)<=30)n++})});
  var b=$('.tabs [data-tab="expiry"]');
  b.innerHTML='<span class="ic">&#9200;</span>Expiry'+(n?'<span class="bd">'+n+"</span>":"");
}
function refresh(){
  renderHeader();renderCount();renderChips();renderResults();renderTabs();
  if(state.tab==="expiry")renderExpiry();
}

/* ---------- Expiry tab ---------- */
function expItems(){
  var it=[];
  state.meds.forEach(function(m){(m.batches||[]).forEach(function(b){if(b.expiry)it.push({m:m,b:b,d:daysLeft(b.expiry)})})});
  it.sort(function(a,b){return a.d-b.d});
  return it;
}
function expTicket(x){
  var m=x.m,b=x.b,lv=expLevel(x.d),right;
  if(x.d<0)right='<div class="tk-price col red"><span class="amt">'+(-x.d)+'</span><span class="cur">'+(x.d===-1?"day ago":"days ago")+"</span></div>";
  else right='<div class="tk-price col"><span class="amt">'+x.d+'</span><span class="cur">'+(x.d===1?"day left":"days left")+"</span></div>";
  return '<li><button class="ticket '+lv+'" data-action="open" data-id="'+esc(m.id)+'">'+
    '<div class="tk-main"><div class="nm">'+esc(m.name)+' <span class="st">'+esc(m.strength)+"</span></div>"+
    '<div class="meta">'+esc(b.no||"No batch number")+(b.qty?", qty "+b.qty:"")+"</div>"+
    '<div class="age">Expires '+esc(fmtDate(parseDay(b.expiry)))+"</div></div>"+right+"</button></li>";
}
function renderExpiry(){
  var it=expItems(),win=state.expWin,c0=0,c30=0,c90=0;
  it.forEach(function(x){if(x.d<0)c0++;else if(x.d<=30)c30++;else if(x.d<=90)c90++});
  var h='<div class="kpis"><div class="kpi bad"><b>'+c0+'</b><span>Expired</span></div><div class="kpi bad"><b>'+c30+'</b><span>Within 30 days</span></div><div class="kpi warn"><b>'+c90+'</b><span>31 to 90 days</span></div></div>';
  h+='<div class="info">Show medicines expiring within</div><div class="chips" style="padding-top:6px">'+
    [30,60,90,180].map(function(w){return '<button class="chip" data-action="win" data-w="'+w+'" aria-pressed="'+(win===w)+'">'+w+" days</button>"}).join("")+"</div>";
  var bands=[["Expired",-99999,-1],["Within 30 days",0,30],["31 to 60 days",31,60],["61 to 90 days",61,90],["91 to 180 days",91,180]],any=false;
  bands.forEach(function(b){
    var g=it.filter(function(x){return x.d>=b[1]&&x.d<=b[2]&&(x.d<0||x.d<=win)});
    if(!g.length)return;
    any=true;
    h+='<div class="band">'+b[0]+" ("+g.length+')</div><ul class="list">'+g.map(expTicket).join("")+"</ul>";
  });
  if(!any)h+='<div class="empty"><p>Nothing expires in the next '+win+" days.</p></div>";
  h+='<p class="hint" style="margin:16px 2px 0">In the Android app you also get a weekly reminder when medicines are close to expiry.</p>';
  $("#view-expiry").innerHTML=h;
}

/* ---------- Sales tab ---------- */
function calc(){
  var s=state.sale,sub=0;
  s.cart.forEach(function(c){var m=findMed(c.id);if(m)sub+=m.sell*c.qty});
  var disc=Math.min(money(s.disc),sub);
  return{sub:sub,disc:disc,total:sub-disc,paid:money(s.paid)};
}
function renderTotals(){
  var el=$("#totals");if(!el)return;
  var t=calc(),h='<div class="tot"><span>Subtotal</span><span>'+naira(t.sub)+"</span></div>";
  if(t.disc)h+='<div class="tot"><span>Discount</span><span>-'+naira(t.disc)+"</span></div>";
  h+='<div class="tot g"><span>Total</span><span>'+naira(t.total)+"</span></div>";
  if(t.paid&&t.total){
    if(t.paid>=t.total)h+='<div class="tot"><span>Change</span><span>'+naira(t.paid-t.total)+"</span></div>";
    else h+='<div class="tot"><span>Balance due</span><span>'+naira(t.total-t.paid)+"</span></div>";
  }
  el.innerHTML=h;
}
function renderCart(){
  var el=$("#cart");if(!el)return;
  var s=state.sale,lines=[];
  s.cart.forEach(function(c){var m=findMed(c.id);if(m)lines.push({c:c,m:m})});
  s.cart=lines.map(function(x){return x.c});
  if(!lines.length){el.innerHTML='<p class="hint" style="margin:0">No items yet. Search above and tap a medicine.</p>'}
  else el.innerHTML=lines.map(function(x){
    var id=esc(x.m.id);
    return '<div class="line"><div><div class="ln-nm">'+esc(x.m.name)+" "+esc(x.m.strength)+'</div><div class="hint" style="margin:0">'+naira(x.m.sell)+' each</div></div>'+
      '<div class="qty"><button data-action="qdn" data-id="'+id+'" aria-label="Less">\u2212</button><span>'+x.c.qty+'</span><button data-action="qup" data-id="'+id+'" aria-label="More">+</button></div>'+
      '<div class="ln-tot">'+naira(x.m.sell*x.c.qty)+'</div><button class="rm" data-action="qrm" data-id="'+id+'" aria-label="Remove">\u2715</button></div>';
  }).join("");
  renderTotals();
}
function renderSaleSearch(){
  var el=$("#sres"),inp=$("#sq");if(!el||!inp)return;
  var q=inp.value;
  if(!norm(q).trim()){el.innerHTML="";return}
  var r=search(q,state.meds).slice(0,6);
  el.innerHTML=r.length?r.map(function(m){
    return '<li><button class="pick" data-action="pick" data-id="'+esc(m.id)+'"><span><b>'+esc(m.name)+"</b> "+esc(m.strength)+'<br><span class="hint">'+esc([m.form,m.pack].filter(Boolean).join(", "))+"</span></span><b>"+naira(m.sell)+"</b></button></li>";
  }).join(""):'<li class="hint">No match. Add it on the Prices tab first.</li>';
}
function historyHTML(){
  var tot=0,n=0,today=new Date().toDateString();
  state.sales.forEach(function(s){if(new Date(s.date).toDateString()===today){tot+=s.total;n++}});
  var h='<div class="card" style="margin-top:8px"><p style="margin:0">Sales today</p><div class="bignum">'+naira(tot)+'</div><p style="margin:4px 0 0">'+n+(n===1?" receipt":" receipts")+"</p></div>";
  if(!state.sales.length)return h+'<div class="empty"><p>No receipts yet.</p></div>';
  return h+'<ul class="list">'+state.sales.map(function(s){
    return '<li><button class="ticket plain" data-action="openReceipt" data-id="'+esc(s.id)+'"><div class="tk-main"><div class="nm">'+esc(s.customer)+'</div><div class="meta">'+esc(s.no)+", "+esc(s.payment)+'</div><div class="meta">'+esc(fmtDT(s.date))+'</div></div><div class="tk-price"><span class="cur">\u20A6</span><span class="amt">'+Number(s.total).toLocaleString("en-NG")+"</span></div></button></li>";
  }).join("")+"</ul>";
}
function renderSales(){
  var v=$("#view-sales"),s=state.sale;
  var sub='<div class="chips" style="padding-top:8px"><button class="chip" data-action="salesTab" data-t="new" aria-pressed="'+(state.salesTab==="new")+'">New sale</button><button class="chip" data-action="salesTab" data-t="history" aria-pressed="'+(state.salesTab==="history")+'">Receipts ('+state.sales.length+")</button></div>";
  if(state.salesTab==="history"){v.innerHTML=sub+historyHTML();return}
  var moreBlock=s.more?(
    '<div class="two"><div class="field" style="margin-top:0"><label for="s_pay">Payment</label><select id="s_pay">'+PAY.map(function(p){return "<option"+(s.payment===p?" selected":"")+">"+p+"</option>"}).join("")+"</select></div>"+
    moneyField("s_disc","Discount",s.disc)+"</div>"+
    moneyField("s_paid","Amount received (optional)",s.paid)
  ):'<button class="more" data-action="toggleMore">+ Add payment method, discount or amount received</button>';
  v.innerHTML=sub+
  '<div class="card"><h2>1. Add medicines</h2><p>Prices come from your price list.</p><input id="sq" type="search" placeholder="Type a medicine name" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search medicine to add"><ul class="list" id="sres"></ul></div>'+
  '<div class="card"><h2>2. Items in this sale</h2><div id="cart"></div></div>'+
  '<div class="card"><h2>3. Customer</h2>'+
  '<div class="field" style="margin-top:0"><label for="s_cust">Customer name (optional)</label><input id="s_cust" value="'+esc(s.customer)+'" placeholder="Walk-in customer" autocomplete="off"></div>'+
  moreBlock+
  '<div id="totals" style="margin-top:14px"></div>'+
  '<button class="primary" style="width:100%;margin-top:14px" data-action="makeReceipt">Print receipt</button></div>';
  renderCart();
}

/* ---------- Receipt ---------- */
function receiptHTML(s){
  var st=state.settings,rows=s.items.map(function(it){
    return '<tr><td>'+esc(it.name)+" "+esc(it.strength)+'<br><span class="sm">'+it.qty+" x "+naira(it.price)+'</span></td><td class="r">'+naira(it.price*it.qty)+"</td></tr>";
  }).join("");
  var bal=s.paid>0&&s.paid<s.total?s.total-s.paid:0;
  var t='<div class="tt"><span>Subtotal</span><span>'+naira(s.subtotal)+"</span></div>";
  if(s.discount)t+='<div class="tt"><span>Discount</span><span>-'+naira(s.discount)+"</span></div>";
  t+='<div class="tt g"><span>TOTAL</span><span>'+naira(s.total)+"</span></div>";
  if(s.paid>0){t+='<div class="tt"><span>Amount received</span><span>'+naira(s.paid)+"</span></div>";
    if(bal)t+='<div class="tt"><span>Balance due</span><span>'+naira(bal)+"</span></div>";
    else if(s.change)t+='<div class="tt"><span>Change</span><span>'+naira(s.change)+"</span></div>"}
  return '<div class="paper"><div class="c"><h4>'+esc(st.name)+'</h4><div class="sm">'+esc(st.address)+"</div><div class=\"sm\">"+esc(st.phone)+"</div></div><hr>"+
    '<div class="tt"><span>Receipt no.</span><span>'+esc(s.no)+'</span></div><div class="tt"><span>Date</span><span>'+esc(fmtDT(s.date))+'</span></div>'+
    '<div class="tt"><span>Customer</span><span>'+esc(s.customer)+'</span></div><div class="tt"><span>Payment</span><span>'+esc(s.payment)+"</span></div><hr>"+
    "<table>"+rows+"</table><hr>"+t+'<hr><div class="c sm">'+esc(st.footer)+"</div></div>";
}
function receiptText(s){
  var st=state.settings,L=[st.name,st.address,st.phone,"--------------------","Receipt no: "+s.no,"Date: "+fmtDT(s.date),"Customer: "+s.customer,"Payment: "+s.payment,"--------------------"];
  s.items.forEach(function(it){L.push(it.qty+" x "+it.name+" "+it.strength+"  "+naira(it.price*it.qty))});
  L.push("--------------------");
  if(s.discount)L.push("Discount: -"+naira(s.discount));
  L.push("TOTAL: "+naira(s.total));
  if(s.paid>0){L.push("Received: "+naira(s.paid));if(s.paid<s.total)L.push("Balance due: "+naira(s.total-s.paid));else if(s.change)L.push("Change: "+naira(s.change))}
  L.push("--------------------",st.footer);
  return L.join("\n");
}
function receiptSheetHTML(s){
  return '<div class="backdrop" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Receipt">'+
  '<div class="sh-head"><div><h2>Receipt</h2><p>'+esc(s.no)+'</p></div><button class="x" data-action="close" aria-label="Close">\u2715</button></div>'+
  receiptHTML(s)+
  '<div class="acts"><button class="primary" style="flex:1" data-action="print">Save or print</button><button class="ghost" data-action="shareReceipt">Send</button></div>'+
  '<p class="hint" style="text-align:center;margin-top:10px">In the phone app, Send opens WhatsApp, email or Google Drive directly.</p></div>';
}

/* ---------- Medicine detail and forms ---------- */
function detailHTML(m){
  var d=ageDays(m),lv=level(d),h="",bh="";
  for(var i=0;i<m.history.length;i++){
    var e=m.history[i],nxt=m.history[i+1],chg="";
    if(nxt){var diff=e.price-nxt.price;if(diff)chg='<span class="chg">'+(diff>0?"\u25B2 ":"\u25BC ")+naira(Math.abs(diff))+"</span>"}
    h+='<li><span class="d">'+esc(fmtDate(e.date))+'</span><span><span class="pr">'+naira(e.price)+"</span>"+chg+"</span></li>";
  }
  (m.batches||[]).forEach(function(b){
    var dl=daysLeft(b.expiry);
    bh+='<div class="batch"><div><div class="b1">'+esc(b.no||"No batch number")+(b.qty?", qty "+b.qty:"")+'</div><button class="linkbtn" data-action="delBatch" data-bid="'+esc(b.id)+'">Remove</button></div>'+
       '<div class="r"><div class="b1">'+esc(fmtDate(parseDay(b.expiry)))+'</div><div class="exp '+expLevel(dl)+'">'+esc(expText(dl))+"</div></div></div>";
  });
  var profit="Not set";
  if(m.buy>0){var p=m.sell-m.buy;profit=naira(p)+" ("+Math.round(p/m.buy*100)+"% markup)"}
  var sub=[m.generic&&norm(m.generic)!==norm(m.name)?m.generic:"",m.brand&&norm(m.brand)!==norm(m.name)?"Brand: "+m.brand:""].filter(Boolean).join(". ");
  return '<div class="backdrop" data-action="close"></div>'+
  '<div class="sheet" role="dialog" aria-modal="true" aria-label="'+esc(m.name)+'">'+
  '<div class="sh-head"><div><h2>'+esc(m.name)+" "+esc(m.strength)+"</h2><p>"+esc([m.form,m.pack].filter(Boolean).join(", "))+(sub?"<br>"+esc(sub):"")+'</p></div><button class="x" data-action="close" aria-label="Close">\u2715</button></div>'+
  '<div class="bigprice"><div><div class="lbl">Selling price</div><div class="p">'+naira(m.sell)+'</div></div><div class="age '+lv+'">'+esc(ageText(d))+"</div></div>"+
  '<div class="quick"><label for="np">Change the price</label><div class="row"><div class="money"><span>\u20A6</span><input id="np" inputmode="numeric" placeholder="New price"></div><button class="primary" data-action="savePrice">Save</button></div></div>'+
  '<dl class="facts"><div><dt>Buying price</dt><dd>'+(m.buy>0?naira(m.buy):"Not set")+"</dd></div><div><dt>Profit per pack</dt><dd>"+esc(profit)+"</dd></div>"+
  "<div><dt>Supplier</dt><dd>"+esc(m.supplier||"Not set")+"</dd></div><div><dt>Group</dt><dd>"+esc(m.category||"Other")+"</dd></div>"+
  (m.notes?'<div class="wide"><dt>Notes</dt><dd>'+esc(m.notes)+"</dd></div>":"")+"</dl>"+
  "<h3>Batches and expiry</h3>"+(bh||'<p class="hint" style="margin:0 0 6px">No batches yet. Add the expiry date of each batch you stock.</p>')+
  '<div class="three" style="margin-top:6px">'+fieldHTML("b_no","Batch no.","",'autocomplete="off"')+fieldHTML("b_exp","Expiry date","",'',"date")+fieldHTML("b_qty","Qty","",'inputmode="numeric"')+"</div>"+
  '<button class="ghost" style="width:100%;margin-top:10px" data-action="addBatch">Add batch</button>'+
  "<h3>Price history</h3><ul class=\"hist\">"+h+"</ul>"+
  '<div class="acts"><button class="ghost" data-action="edit">Edit details</button><button class="ghost danger" data-action="del">Delete</button></div></div>';
}
function fieldHTML(id,label,val,extra,type){
  var er=state.errs[id];
  return '<div class="field'+(er?" err":"")+'"><label for="'+id+'">'+label+'</label><input id="'+id+'" value="'+esc(val)+'" '+(extra||"")+(type?' type="'+type+'"':"")+">"+(er?'<div class="msg">'+esc(er)+"</div>":"")+"</div>";
}
function moneyField(id,label,val){
  var er=state.errs[id];
  return '<div class="field'+(er?" err":"")+'"><label for="'+id+'">'+label+'</label><div class="money"><span>\u20A6</span><input id="'+id+'" inputmode="numeric" value="'+esc(val)+'"></div>'+(er?'<div class="msg">'+esc(er)+"</div>":"")+"</div>";
}
function formHTML(){
  var d=state.draft,isNew=!state.openId;
  var formOpts=FORMS.map(function(f){return '<option'+(d.form===f?" selected":"")+">"+f+"</option>"}).join("");
  var catOpts=CATS.map(function(c){return '<option'+(d.category===c?" selected":"")+">"+c+"</option>"}).join("");
  var formEr=state.errs.f_form;
  return '<div class="backdrop" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="'+(isNew?"Add medicine":"Edit medicine")+'">'+
  '<div class="sh-head"><div><h2>'+(isNew?"Add medicine":"Edit medicine")+'</h2><p>Name, strength, form and price are all you really need.</p></div><button class="x" data-action="close" aria-label="Close">\u2715</button></div>'+
  fieldHTML("f_name","Medicine name",d.name,'autocomplete="off"')+
  '<div class="two">'+fieldHTML("f_strength","Strength",d.strength,'placeholder="500mg" autocomplete="off"')+
  '<div class="field'+(formEr?" err":"")+'"><label for="f_form">Form</label><select id="f_form"><option value="">Choose</option>'+formOpts+"</select>"+(formEr?'<div class="msg">'+esc(formEr)+"</div>":"")+"</div></div>"+
  '<div class="two">'+moneyField("f_sell","Selling price",d.sell)+moneyField("f_buy","Buying price (optional)",d.buy)+"</div>"+
  fieldHTML("f_pack","Pack size",d.pack,'placeholder="20 capsules" autocomplete="off"')+
  '<div class="two">'+fieldHTML("f_generic","Generic name",d.generic,'autocomplete="off"')+fieldHTML("f_brand","Brand",d.brand,'autocomplete="off"')+"</div>"+
  fieldHTML("f_supplier","Supplier",d.supplier,'autocomplete="off"')+
  '<div class="field"><label for="f_cat">Group</label><select id="f_cat">'+catOpts+"</select></div>"+
  '<div class="field"><label for="f_notes">Notes</label><textarea id="f_notes" rows="2">'+esc(d.notes)+"</textarea></div>"+
  '<div class="acts"><button class="ghost" data-action="'+(isNew?"close":"back")+'">Cancel</button><button class="primary" style="flex:1" data-action="saveForm">Save</button></div></div>';
}
function renderSheet(focusId,keep){
  var root=$("#sheet-root"),old=root.querySelector(".sheet"),st=old?old.scrollTop:0;
  if(!state.sheet){root.innerHTML="";if(!state.confirm&&!state.onb)document.body.style.overflow="";return}
  document.body.style.overflow="hidden";
  if(state.sheet==="view"){var m=findMed(state.openId);if(!m){state.sheet=null;return renderSheet()}root.innerHTML=detailHTML(m)}
  else if(state.sheet==="receipt"){var s=findSale(state.receiptId);if(!s){state.sheet=null;return renderSheet()}root.innerHTML=receiptSheetHTML(s)}
  else root.innerHTML=formHTML();
  if(keep){var ns=root.querySelector(".sheet");if(ns)ns.scrollTop=st}
  if(focusId){var el=document.getElementById(focusId);if(el)el.focus()}
}
function closeSheet(){state.sheet=null;state.openId=null;state.receiptId=null;state.draft=null;state.errs={};renderSheet()}

function blankDraft(name){return{name:name||"",strength:"",form:"",sell:"",buy:"",pack:"",generic:"",brand:"",supplier:"",category:"Other",notes:""}}
function draftFrom(m){return{name:m.name,strength:m.strength,form:m.form,sell:String(m.sell),buy:m.buy?String(m.buy):"",pack:m.pack||"",generic:m.generic||"",brand:m.brand||"",supplier:m.supplier||"",category:m.category||"Other",notes:m.notes||""}}
function readDraft(){
  function v(id){var e=document.getElementById(id);return e?e.value.trim():""}
  return{name:v("f_name"),strength:v("f_strength"),form:v("f_form"),sell:v("f_sell"),buy:v("f_buy"),pack:v("f_pack"),generic:v("f_generic"),brand:v("f_brand"),supplier:v("f_supplier"),category:v("f_cat")||"Other",notes:v("f_notes")};
}

var tt;
function toast(t){var el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){el.classList.remove("show")},2600)}

/* ---------- Confirm dialog (Yes / Cancel, replaces tap-twice) ---------- */
function askConfirm(title,msg,yesLabel,onYes){
  state.confirm={title:title,msg:msg,yesLabel:yesLabel||"Yes, continue",onYes:onYes};
  renderConfirm();
}
function renderConfirm(){
  var root=$("#confirm-root");
  if(!state.confirm){root.innerHTML="";if(!state.sheet&&!state.onb)document.body.style.overflow="";return}
  document.body.style.overflow="hidden";
  var c=state.confirm;
  root.innerHTML='<div class="backdrop" data-action="cancelConfirm"></div><div class="confirm" role="alertdialog" aria-modal="true" aria-label="'+esc(c.title)+'">'+
    "<h3>"+esc(c.title)+"</h3><p>"+esc(c.msg)+'</p><div class="row"><button class="ghost" data-action="cancelConfirm">Cancel</button><button class="primary" data-action="yesConfirm">'+esc(c.yesLabel)+"</button></div></div>";
}
function cancelConfirm(){state.confirm=null;renderConfirm()}
function yesConfirm(){var fn=state.confirm&&state.confirm.onYes;state.confirm=null;renderConfirm();if(fn)fn()}

/* ---------- Save data tab ---------- */
function renderBackup(){
  var st=state.settings;
  $("#view-backup").innerHTML=
  '<div class="card"><h2>Pharmacy name</h2><p>Shown at the top of the app and on every receipt.</p>'+
  fieldHTML("c_name","Pharmacy name",st.name,'autocomplete="off"')+
  '<button class="primary" style="margin-top:14px" data-action="saveName">Save name</button></div>'+
  '<div class="card"><h2>Receipt details</h2><p>Shown at the bottom of receipts and used for the address and phone number.</p>'+
  fieldHTML("c_addr","Address",st.address,'autocomplete="off"')+
  fieldHTML("c_phone","Phone",st.phone,'inputmode="tel" autocomplete="off"')+fieldHTML("c_foot","Footer message",st.footer,'autocomplete="off"')+
  '<button class="primary" style="margin-top:14px" data-action="saveSettings">Save details</button></div>'+
  '<div class="card"><h2>Your data</h2><p>Saved on this device, no internet needed.</p><div class="bignum">'+state.meds.length+'</div><p style="margin:4px 0 0">medicines, '+state.sales.length+" receipts</p></div>"+
  '<div class="card"><h2>Save my data</h2><p>So you never lose your prices if the tablet is lost, damaged or replaced.</p>'+
  '<div class="bighint">Tap the button below. It opens WhatsApp, Google Drive or email, the same way you would send a photo.</div>'+
  '<button class="primary" style="width:100%;margin-top:12px" data-action="backup">Send my data somewhere safe</button>'+
  '<details style="margin-top:14px"><summary class="linkbtn" style="cursor:pointer">More options</summary>'+
  '<textarea id="bk" aria-label="Backup text" style="margin-top:10px" placeholder="To bring data back from a backup, paste it here."></textarea>'+
  '<div class="row" style="margin-top:10px"><button class="ghost" data-action="restore">Bring this data back</button></div></details></div>'+
  '<div class="card"><h2>Demo data</h2><p>Put the sample medicines and receipts back the way they started.</p><button class="ghost" data-action="reset">Reset demo data</button></div>';
}
function switchTab(t){
  state.tab=t;
  ["prices","expiry","sales","backup"].forEach(function(n){$("#view-"+n).hidden=n!==t});
  if(t==="expiry")renderExpiry();
  if(t==="sales")renderSales();
  if(t==="backup")renderBackup();
  document.querySelectorAll(".tabs button").forEach(function(b){
    if(b.dataset.tab===t)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
  });
  window.scrollTo(0,0);
}

function sanitize(a){
  var out=[];
  a.forEach(function(x){
    if(!x||!x.name||!(Number(x.sell)>0))return;
    var upd=x.updated||new Date().toISOString(),sell=Math.round(Number(x.sell));
    out.push({id:x.id||nid(),name:String(x.name),generic:x.generic||"",brand:x.brand||"",strength:x.strength||"",form:x.form||"Tablets",pack:x.pack||"",sell:sell,buy:Number(x.buy)>0?Math.round(Number(x.buy)):0,supplier:x.supplier||"",category:x.category||"Other",notes:x.notes||"",updated:upd,
      history:Array.isArray(x.history)&&x.history.length?x.history:[{price:sell,date:upd}],
      batches:Array.isArray(x.batches)?x.batches.filter(function(b){return b&&b.expiry}).map(function(b){return{id:b.id||nid(),no:b.no||"",expiry:String(b.expiry),qty:Number(b.qty)||0}}):[]});
  });
  return out;
}

/* ---------- First-run walkthrough ---------- */
var SLIDES=[
  {ic:"&#128337;",t:"Never forget a price again",p:"Type any medicine name and its current price shows instantly. Works even with no internet."},
  {ic:"&#9200;",t:"Know what's expiring",p:"See which medicines are expiring soon, grouped so nothing catches you by surprise."},
  {ic:"&#128179;",t:"Make a receipt in seconds",p:"Pick the medicines sold, and a printable receipt is ready with the total worked out for you."},
  {ic:"&#128190;",t:"Keep your data safe",p:"One tap sends a backup to WhatsApp or Google Drive, so you never lose your price list."}
];
var onbIdx=0;
function renderOnb(){
  var root=$("#onb-root");
  if(!state.onb){root.innerHTML="";if(!state.sheet&&!state.confirm)document.body.style.overflow="";return}
  document.body.style.overflow="hidden";
  var s=SLIDES[onbIdx],last=onbIdx===SLIDES.length-1;
  root.innerHTML='<div class="onb" role="dialog" aria-modal="true" aria-label="Welcome">'+
    '<div style="display:flex;justify-content:flex-end;padding:14px 14px 0"><button class="skip" data-action="onbSkip">Skip</button></div>'+
    '<div class="onb-body"><div class="onb-ic">'+s.ic+"</div><h2>"+esc(s.t)+"</h2><p>"+esc(s.p)+"</p></div>"+
    '<div class="onb-dots">'+SLIDES.map(function(x,i){return '<span class="'+(i===onbIdx?"on":"")+'"></span>'}).join("")+"</div>"+
    '<div class="onb-foot"><button class="primary" data-action="onbNext">'+(last?"Get started":"Next")+"</button></div></div>";
}
function startOnb(){onbIdx=0;state.onb=true;renderOnb()}
function endOnb(){state.onb=false;try{localStorage.setItem(OKEY,"1")}catch(e){}renderOnb()}

/* ---------- Actions ---------- */
function act(a,btn){
  var m,i;
  if(a==="chip"){state.cat=btn.dataset.cat;renderChips();renderResults()}
  else if(a==="win"){state.expWin=Number(btn.dataset.w);renderExpiry()}
  else if(a==="open"){state.openId=btn.dataset.id;state.sheet="view";renderSheet()}
  else if(a==="openReceipt"){state.receiptId=btn.dataset.id;state.sheet="receipt";renderSheet()}
  else if(a==="close"){closeSheet()}
  else if(a==="add"){state.openId=null;state.draft=blankDraft(state.q.trim());state.errs={};state.sheet="form";renderSheet("f_name")}
  else if(a==="edit"){m=findMed(state.openId);if(m){state.draft=draftFrom(m);state.errs={};state.sheet="form";renderSheet("f_name")}}
  else if(a==="back"){state.sheet="view";state.errs={};renderSheet()}
  else if(a==="tab"){switchTab(btn.dataset.tab)}
  else if(a==="salesTab"){state.salesTab=btn.dataset.t;renderSales()}
  else if(a==="toggleMore"){state.sale.more=true;renderSales()}
  else if(a==="pick"){
    var c=null;for(i=0;i<state.sale.cart.length;i++)if(state.sale.cart[i].id===btn.dataset.id)c=state.sale.cart[i];
    if(c)c.qty=Math.min(999,c.qty+1);else state.sale.cart.push({id:btn.dataset.id,qty:1});
    $("#sq").value="";renderSaleSearch();renderCart();
  }
  else if(a==="qup"||a==="qdn"||a==="qrm"){
    for(i=0;i<state.sale.cart.length;i++){
      var ci=state.sale.cart[i];
      if(ci.id!==btn.dataset.id)continue;
      if(a==="qup")ci.qty=Math.min(999,ci.qty+1);
      else if(a==="qdn")ci.qty=Math.max(1,ci.qty-1);
      else state.sale.cart.splice(i,1);
      break;
    }
    renderCart();
  }
  else if(a==="makeReceipt"){
    var cs=state.sale,lines=[];
    cs.cart.forEach(function(x){var mm=findMed(x.id);if(mm)lines.push({c:x,m:mm})});
    if(!lines.length){toast("Add at least one medicine first");return}
    var t=calc(),maxNo=0;
    state.sales.forEach(function(s){var n=Number(String(s.no).replace(/\D/g,""))||0;if(n>maxNo)maxNo=n});
    var sale={id:nid(),no:"R-"+pad(maxNo+1,4),date:new Date().toISOString(),customer:(cs.customer||"").trim()||"Walk-in customer",payment:cs.payment,
      items:lines.map(function(x){return{name:x.m.name,strength:x.m.strength,form:x.m.form,pack:x.m.pack,price:x.m.sell,qty:x.c.qty}}),
      subtotal:t.sub,discount:t.disc,total:t.total,paid:t.paid,change:t.paid>t.total?t.paid-t.total:0};
    state.sales.unshift(sale);persistSales();state.sale=blankSale();renderSales();
    state.receiptId=sale.id;state.sheet="receipt";renderSheet();
  }
  else if(a==="print"){
    toast("Opening print. In the phone app this saves a PDF file.");
    try{window.print()}catch(e){toast("Saving works in the phone app. Try Send here.")}
  }
  else if(a==="shareReceipt"){var rs=findSale(state.receiptId);if(rs)shareOrCopy(receiptText(rs),rs.no,"Receipt copied. Paste it into WhatsApp.")}
  else if(a==="savePrice"){
    m=findMed(state.openId);var np=money($("#np").value);
    if(!np){toast("Type the new price first");$("#np").focus();return}
    if(np===m.sell){toast("That is already the current price");return}
    m.sell=np;m.updated=new Date().toISOString();m.history.unshift({price:np,date:m.updated});
    persist();refresh();renderSheet();toast("Price saved: "+naira(np));
  }
  else if(a==="addBatch"){
    m=findMed(state.openId);
    var ex=document.getElementById("b_exp").value;
    if(!ex){toast("Choose the expiry date");document.getElementById("b_exp").focus();return}
    m.batches=m.batches||[];
    m.batches.push({id:nid(),no:document.getElementById("b_no").value.trim(),expiry:ex,qty:Math.round(Number(document.getElementById("b_qty").value)||0)});
    m.batches.sort(function(x,y){return x.expiry<y.expiry?-1:x.expiry>y.expiry?1:0});
    persist();refresh();renderSheet(null,true);toast("Batch added");
  }
  else if(a==="delBatch"){
    var bid=btn.dataset.bid;
    askConfirm("Remove this batch?","This cannot be undone.","Yes, remove",function(){
      m=findMed(state.openId);
      m.batches=(m.batches||[]).filter(function(b){return b.id!==bid});
      persist();refresh();renderSheet(null,true);toast("Batch removed");
    });
  }
  else if(a==="del"){
    var mid=state.openId,mm=findMed(mid);
    askConfirm("Delete "+(mm?mm.name:"this medicine")+"?","This cannot be undone.","Yes, delete",function(){
      state.meds=state.meds.filter(function(x){return x.id!==mid});
      persist();closeSheet();refresh();toast("Medicine deleted");
    });
  }
  else if(a==="saveForm"){
    var d=readDraft(),errs={};
    if(!d.name)errs.f_name="Enter the medicine name";
    if(!d.strength)errs.f_strength="Enter the strength";
    if(!d.form)errs.f_form="Choose a form";
    if(!money(d.sell))errs.f_sell="Enter the selling price";
    if(Object.keys(errs).length){state.draft=d;state.errs=errs;renderSheet();return}
    var sell=money(d.sell),buy=money(d.buy),now=new Date().toISOString();
    if(state.openId){
      m=findMed(state.openId);
      if(sell!==m.sell){m.history.unshift({price:sell,date:now});m.updated=now}
      m.name=d.name;m.strength=d.strength;m.form=d.form;m.sell=sell;m.buy=buy;m.pack=d.pack;m.generic=d.generic;m.brand=d.brand;m.supplier=d.supplier;m.category=d.category;m.notes=d.notes;
      persist();state.sheet="view";state.errs={};refresh();renderSheet();toast("Changes saved");
    }else{
      var nm={id:nid(),name:d.name,generic:d.generic,brand:d.brand,strength:d.strength,form:d.form,pack:d.pack,sell:sell,buy:buy,supplier:d.supplier,category:d.category,notes:d.notes,updated:now,history:[{price:sell,date:now}],batches:[]};
      state.meds.push(nm);persist();closeSheet();refresh();toast(d.name+" added at "+naira(sell));
    }
  }
  else if(a==="saveName"){
    var nv=document.getElementById("c_name").value.trim();
    state.settings=Object.assign({},state.settings,{name:nv||DEFAULT_SETTINGS.name});
    saveJSON(CKEY,state.settings);renderHeader();toast("Name saved");
  }
  else if(a==="saveSettings"){
    function gv(id){return document.getElementById(id).value.trim()}
    state.settings=Object.assign({},state.settings,{address:gv("c_addr"),phone:gv("c_phone"),footer:gv("c_foot")});
    saveJSON(CKEY,state.settings);toast("Receipt details saved");
  }
  else if(a==="backup"){
    var txt=JSON.stringify({app:"pharmacy-price-book",version:2,exported:new Date().toISOString(),settings:state.settings,medicines:state.meds,sales:state.sales},null,1);
    var el=document.getElementById("bk");if(el)el.value=txt;
    shareOrCopy(txt,(state.settings.name||"pharmacy")+"-backup","Backup copied. Paste it into WhatsApp or a note.");
  }
  else if(a==="restore"){
    var raw=$("#bk").value.trim();
    if(!raw){toast("Paste your backup into the box first");return}
    var parsed;try{parsed=JSON.parse(raw)}catch(e){toast("That does not look like a backup");return}
    var arr=Array.isArray(parsed)?parsed:parsed&&parsed.medicines;
    var clean=Array.isArray(arr)?sanitize(arr):[];
    if(!clean.length){toast("No medicines found in that backup");return}
    askConfirm("Replace all data?","Your current medicines and receipts will be replaced with this backup.","Yes, bring it back",function(){
      state.meds=clean;persist();
      if(parsed&&Array.isArray(parsed.sales)){state.sales=parsed.sales;persistSales()}
      if(parsed&&parsed.settings&&parsed.settings.name){state.settings=parsed.settings;saveJSON(CKEY,state.settings)}
      refresh();renderBackup();toast(clean.length+" medicines restored");
    });
  }
  else if(a==="reset"){
    askConfirm("Reset to demo data?","Your current medicines and receipts will be replaced with the sample data.","Yes, reset",function(){
      state.meds=seed();persist();state.sales=seedSales();persistSales();state.sale=blankSale();refresh();renderBackup();toast("Demo data restored");
    });
  }
  else if(a==="cancelConfirm"){cancelConfirm()}
  else if(a==="yesConfirm"){yesConfirm()}
  else if(a==="onbSkip"){endOnb()}
  else if(a==="onbNext"){
    if(onbIdx<SLIDES.length-1){onbIdx++;renderOnb()}else endOnb();
  }
}

document.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(b)act(b.dataset.action,b)});
document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;if(state.confirm)cancelConfirm();else if(state.sheet)closeSheet()});
document.addEventListener("input",function(e){
  var id=e.target.id;
  if(id==="q"){state.q=e.target.value;renderResults()}
  else if(id==="sq"){renderSaleSearch()}
  else if(id==="s_cust"){state.sale.customer=e.target.value}
  else if(id==="s_disc"){state.sale.disc=e.target.value;renderTotals()}
  else if(id==="s_paid"){state.sale.paid=e.target.value;renderTotals()}
});
document.addEventListener("change",function(e){if(e.target.id==="s_pay")state.sale.payment=e.target.value});

refresh();
if(!loadJSON(OKEY)){startOnb()}
})();
