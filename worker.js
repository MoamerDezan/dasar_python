importScripts('pyodide/pyodide.js');
const H=`
import sys,traceback,json,builtins
def _input(p=''):
    l=sys.stdin.readline()
    if not l: sys.stdout.write(str(p)); raise EOFError('EOF when reading a line')
    l=l.rstrip('\\n'); sys.stdout.write(str(p)+l+'\\n'); return l
builtins.input=_input
def _run(src):
    try:
        exec(compile(src,'main.py','exec'),{'__name__':'__main__'})
        return None
    except BaseException as e:
        tb=e.__traceback__
        while tb and tb.tb_frame.f_code.co_filename!='main.py': tb=tb.tb_next
        ln=getattr(e,'lineno',None) if isinstance(e,SyntaxError) else None
        t=tb
        while t:
            if t.tb_frame.f_code.co_filename=='main.py': ln=t.tb_lineno
            t=t.tb_next
        return json.dumps({'type':type(e).__name__,'msg':str(e),'line':ln,'text':''.join(traceback.format_exception(type(e),e,tb))})
`;
let py,out=[];
const ready=(async()=>{
  py=await loadPyodide({indexURL:new URL('pyodide/',self.location.href).href});
  py.setStdout({batched:s=>out.push(s)});py.setStderr({batched:s=>out.push(s)});
  py.runPython(H);postMessage({t:'ready'});
})();
onmessage=async e=>{
  await ready;const{code,inputs}=e.data;out=[];const q=[...inputs];
  py.setStdin({stdin:()=>q.length?q.shift():null});
  let err=null;
  try{const r=py.globals.get('_run')(code);err=r?JSON.parse(r):null}
  catch(x){err={type:'Error',msg:String(x),text:String(x),line:null}}
  postMessage({t:'done',out:out.join('\n'),err});
};
