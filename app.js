// ===== Pengaturan =====
const APPS_SCRIPT_URL=''; // isi dengan URL Web App Apps Script (tahap 2). Kosong = mode demo.
const KELAS=['XA','XB','XC','XD','XE','XF','XG','XH','XI','XJ'];
const $=id=>document.getElementById(id);
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const ALL=LESSONS.flatMap(l=>l.ex.map((e,i)=>({...e,lesson:l,key:l.id+'.'+(i+1)})));
let user=LS('user'),cur=0,worker,ready=false,resolveRun,toastT;
let st; // statistik latihan berjalan
const toast=m=>{const t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3500)};

// ===== Login =====
$('kelas').innerHTML=KELAS.map(k=>`<option>${k}</option>`).join('');
$('cek').onclick=async()=>{
  $('lmsg').textContent='';
  const kelas=$('kelas').value,kode=$('kode').value.trim();
  let siswa;
  if(!APPS_SCRIPT_URL){siswa=[1,2,3].map(n=>({absen:n,nama:'Siswa Contoh '+n}))}
  else try{const r=await(await fetch(`${APPS_SCRIPT_URL}?aksi=daftar&kelas=${kelas}&kode=${encodeURIComponent(kode)}`)).json();
    if(!r.ok)throw 0;siswa=r.siswa}catch(e){$('lmsg').textContent='Kode kelas salah atau jaringan bermasalah.';return}
  $('nama').innerHTML=siswa.map(s=>`<option value="${s.absen}">${s.absen}. ${s.nama}</option>`).join('');
  $('namaw').hidden=$('mulai').hidden=false;
  $('mulai').onclick=()=>{const o=$('nama').selectedOptions[0];
    user={kelas,kode,absen:+o.value,nama:o.textContent.replace(/^\d+\.\s*/,'')};LS('user',user);boot()};
};

// ===== Python worker =====
function startWorker(){
  ready=false;$('status').textContent='Memuat Python… (unduhan pertama ±10 MB, setelah itu cepat)';
  worker=new Worker('worker.js');
  worker.onmessage=e=>{if(e.data.t==='ready'){ready=true;$('status').textContent='Python siap.'}
    else if(resolveRun)resolveRun(e.data)};
}
const exec=(code,inputs)=>new Promise(res=>{resolveRun=res;worker.postMessage({code,inputs})});
const timed=async(code,inputs)=>{
  const t=setTimeout(()=>{worker.terminate();startWorker();resolveRun({out:'',err:{type:'Timeout',msg:'',text:'Program berjalan terlalu lama dan dihentikan.',line:null}})},10000);
  const r=await exec(code,inputs);clearTimeout(t);return r;
};

// ===== Penjelasan error (bahasa Indonesia) =====
function explain(e){
  const m=e.msg||'',n=(m.match(/name '(\w+)'/)||[])[1];let a,c;
  switch(e.type){
  case'SyntaxError':a='Aturan penulisan Python dilanggar, sehingga program tidak bisa dibaca.';
    c=/expected ':'/.test(m)?'Ada titik dua <code>:</code> yang hilang di akhir baris if, else, atau sejenisnya.'
     :/never closed|unterminated|EOL/.test(m)?'Ada tanda kutip atau kurung yang dibuka tetapi tidak ditutup.'
     :/Maybe you meant '=='/.test(m)?'Di dalam <code>if</code>, gunakan <code>==</code> untuk membandingkan, bukan <code>=</code>.'
     :'Periksa baris itu dan baris sebelumnya: titik dua, kutip, kurung, dan ejaan perintah.';break;
  case'IndentationError':a='Jorokan (spasi di awal baris) tidak sesuai.';
    c=/expected an indented/.test(m)?'Isi <code>if</code> atau <code>else</code> harus dijorokkan 4 spasi (tekan Tab).':'Baris-baris yang sejajar harus memakai jumlah spasi yang sama.';break;
  case'NameError':a=`Python menemukan nama <code>${n||''}</code>, tetapi belum ada variabel atau perintah dengan nama itu.`;
    c='Periksa salah ketik (huruf besar dan kecil dianggap beda), atau pastikan variabelnya sudah dibuat di baris sebelumnya.';break;
  case'TypeError':a='Operasi dilakukan pada jenis data yang tidak cocok.';
    c=/concatenate|unsupported operand|not supported between/.test(m)?'Kemungkinan teks dari <code>input()</code> belum diubah menjadi angka. Gunakan <code>int()</code> atau <code>float()</code>.':'Periksa jenis data (teks atau angka) pada baris itu.';break;
  case'ValueError':a='Nilai yang diberikan tidak bisa diubah ke jenis data yang diminta.';
    c='Biasanya isi kotak Input bukan angka padahal program memakai <code>int()</code> atau <code>float()</code>. Periksa isi kotak Input.';break;
  case'ZeroDivisionError':a='Ada pembagian dengan nol.';c='Periksa nilai pembagi pada baris itu.';break;
  case'EOFError':a='Program meminta masukan lebih banyak daripada yang kamu isi di kotak Input.';
    c='Isi kotak Input satu baris untuk setiap <code>input()</code> di kode.';break;
  case'Timeout':a='Program tidak selesai dalam 10 detik.';c='Mungkin ada perulangan yang tidak pernah berhenti.';break;
  default:a='Python menemukan masalah saat menjalankan kode.';c='Baca jenis error di atas dan periksa barisnya.'}
  return`<b>Artinya</b>${a}<b>Letaknya</b>${e.line?'Baris '+e.line:'Tidak diketahui'}<b>Coba periksa</b>${c}`;
}

// ===== Editor: blokir paste dari luar, pencatatan =====
const ed=$('ed');let lastCopied='',allowPaste=false;
const blocked=()=>{st.paste++;toast('Ketik sendiri kodenya ya, supaya cepat paham.')};
const copyCap=()=>{const s=ed.value.slice(ed.selectionStart,ed.selectionEnd);if(s)lastCopied=s};
ed.addEventListener('copy',copyCap);ed.addEventListener('cut',copyCap);
ed.addEventListener('paste',e=>{const t=(e.clipboardData||window.clipboardData).getData('text');
  if(t&&t===lastCopied){allowPaste=true}else{e.preventDefault();allowPaste=false;blocked()}});
ed.addEventListener('drop',e=>{e.preventDefault();blocked()});
ed.addEventListener('beforeinput',e=>{
  if(e.inputType==='insertFromPaste'){if(!allowPaste){e.preventDefault();blocked()}allowPaste=false;return}
  if(e.inputType==='insertFromDrop'||e.inputType==='insertFromYank'){e.preventDefault();blocked();return}
  const d=e.data||(e.dataTransfer&&e.dataTransfer.getData('text'))||'';
  if(d.length>20){e.preventDefault();blocked()}});
ed.addEventListener('input',()=>{st.keys++;
  if(/[“”‘’]/.test(ed.value)){const p=ed.selectionStart;ed.value=ed.value.replace(/[“”]/g,'"').replace(/[‘’]/g,"'");ed.setSelectionRange(p,p)}
  LS('code:'+ALL[cur].key,ed.value)});
ed.addEventListener('keydown',e=>{
  if(e.key==='Tab'){e.preventDefault();ins('    ')}
  else if(e.key==='Enter'){e.preventDefault();const b=ed.value.slice(0,ed.selectionStart),l=b.slice(b.lastIndexOf('\n')+1);
    ins('\n'+l.match(/^ */)[0]+(/:\s*$/.test(l)?'    ':''))}});
function ins(t){ed.setRangeText(t,ed.selectionStart,ed.selectionEnd,'end');ed.dispatchEvent(new Event('input'))}
$('keys').innerHTML=[['Tab','    '],[':',':'],['"','"'],['(','('],[')',')'],['=','='],['==','=='],['>=','>='],['%','%']]
  .map(([a,b])=>`<button type="button" data-t="${b}">${a}</button>`).join('');
$('keys').onclick=e=>{const t=e.target.dataset.t;if(t){ed.focus();ins(t)}};
$('inp').addEventListener('paste',e=>{if(/\n.{20,}/.test(e.clipboardData.getData('text'))||e.clipboardData.getData('text').length>60)e.preventDefault()});

// ===== Tampilan =====
function show(i){
  cur=i;const x=ALL[i],done=LS('done')||{};
  st={t0:Date.now(),keys:0,paste:0,runs:0,tries:0,errs:[]};
  $('nav').innerHTML=ALL.map((e,j)=>`<button data-i="${j}" class="${j===i?'on':''} ${done[user.kelas+user.absen+e.key]?'done':''}">${e.key}</button>`).join('');
  const first=x.lesson.ex[0]===x;
  $('left').innerHTML=(first?`<h2>Lesson ${x.lesson.id}: ${x.lesson.title}</h2>${x.lesson.html}`:`<h2>Lesson ${x.lesson.id}: ${x.lesson.title}</h2><p class="hint">Materi ada di latihan pertama lesson ini (${x.lesson.id}.1).</p>`)
   +`<div class="task"><b>Latihan ${x.key}: ${x.t}</b><p>${x.task}</p><button class="sec" id="hb">Beri petunjuk</button><p id="hs" class="hint"></p></div>`;
  let h=0;$('hb').onclick=()=>{$('hs').innerHTML=x.hints.slice(0,++h).map((t,k)=>`Petunjuk ${k+1}: ${t}`).join('<br>');if(h>=x.hints.length)$('hb').hidden=true};
  ed.value=LS('code:'+x.key)??x.start;$('out').textContent='';$('exp').hidden=true;$('res').textContent='';$('res').className='';$('inp').value='';
}
$('nav').onclick=e=>{if(e.target.dataset.i)show(+e.target.dataset.i)};
function showResult(r){
  $('out').textContent=(r.out||'')+(r.err?(r.out?'\n':'')+r.err.text:'');
  if(r.err){$('exp').innerHTML=explain(r.err);$('exp').hidden=false;st.errs.push(r.err.type)}else $('exp').hidden=true;
}
async function guard(f){if(!ready){toast('Python masih dimuat, tunggu sebentar.');return}$('run').disabled=$('chk').disabled=true;try{await f()}finally{$('run').disabled=$('chk').disabled=false}}
$('run').onclick=()=>guard(async()=>{st.runs++;showResult(await timed(ed.value,$('inp').value.split('\n').filter((l,i,a)=>l!==''||i<a.length-1)))});
$('chk').onclick=()=>guard(async()=>{
  const x=ALL[cur];st.tries++;let ok=true,msg='';
  for(const t of x.tests){const r=await timed(ed.value,t.i);
    if(r.err){ok=false;showResult(r);msg='Kode error saat diperiksa.';st.errs.push(r.err.type);break}
    const last=(r.out.split('\n').filter(s=>s.trim()).pop()||'').trim();
    if(last!==t.o){ok=false;msg='Hasilnya belum tepat untuk salah satu contoh uji. Periksa kembali, lalu coba lagi.';break}}
  $('res').className=ok?'ok':'no';$('res').textContent=ok?'Benar! Semua pengujian lulus.':msg;
  if(ok){const d=LS('done')||{};d[user.kelas+user.absen+x.key]=1;LS('done',d);document.querySelector(`nav [data-i="${cur}"]`).classList.add('done')}
  send({kelas:user.kelas,absen:user.absen,nama:user.nama,lesson:x.lesson.id,latihan:x.key,status:ok?'lulus':'gagal',
    percobaan:st.tries,detik:Math.round((Date.now()-st.t0)/1000),ketikan:st.keys,paste_diblokir:st.paste,dijalankan:st.runs,error:[...new Set(st.errs)].join(','),jawaban:ed.value,waktu:new Date().toISOString()});
});
$('stop').onclick=()=>{worker.terminate();startWorker();$('out').textContent='Dihentikan.'};
$('rst').onclick=()=>{if(confirm('Kembalikan kode ke awal?')){localStorage.removeItem('code:'+ALL[cur].key);show(cur)}};

// ===== Pengiriman ke guru (antrean, kirim ulang jika gagal) =====
async function send(rec){const q=LS('queue')||[];q.push(rec);LS('queue',q);flush()}
async function flush(){
  if(!APPS_SCRIPT_URL)return;let q=LS('queue')||[];
  while(q.length){try{await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',body:JSON.stringify({kelas:user.kelas,kode:user.kode,...q[0]})});q.shift();LS('queue',q)}catch(e){return}}
}
addEventListener('online',flush);

function boot(){$('login').hidden=true;$('app').hidden=false;$('who').textContent=`${user.kelas} / ${user.absen}. ${user.nama}`;startWorker();show(0);flush()}
st={keys:0,paste:0};if(user)boot();
