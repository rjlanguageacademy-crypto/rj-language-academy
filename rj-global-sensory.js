/* RJ Language Academy global sensory bridge — isolated enhancement; no content replacement.
   New members-studio.html has its own scoped synthesis and does not import this file. */
(function(){
'use strict';
if(window.RJGlobalSensory) return;
const audio={context:null,enabled:true,lastClick:0,lastResult:0};
try {audio.enabled=localStorage.getItem('rj_sound_enabled')!=='false'}catch(_){}
function ctx(){
 if(!audio.enabled) return null;
 const Constructor=window.AudioContext||window.webkitAudioContext;
 if(!Constructor) return null;
 try{if(!audio.context)audio.context=new Constructor();if(audio.context.state==='suspended')audio.context.resume().catch(()=>{});return audio.context}catch(_){return null}
}
function tone(frequency,duration,shape,volume,delay){
 const c=ctx();if(!c)return;
 const start=c.currentTime+(delay||0),end=start+duration;
 try{
  const osc=c.createOscillator(),gain=c.createGain();
  osc.type=shape||'sine';osc.frequency.setValueAtTime(frequency,start);
  gain.gain.setValueAtTime(0.0001,start);gain.gain.exponentialRampToValueAtTime(volume||.018,start+.009);
  gain.gain.exponentialRampToValueAtTime(.0001,end);
  osc.connect(gain);gain.connect(c.destination);osc.start(start);osc.stop(end+.01);
 }catch(_){}
}
function click(){let now=performance.now();if(now-audio.lastClick<95)return;audio.lastClick=now;tone(940,.045,'triangle',.012,0);tone(570,.055,'sine',.008,.012)}
function success(){tone(523.25,.16,'sine',.032,0);tone(659.25,.19,'sine',.033,.105);tone(783.99,.25,'sine',.03,.22)}
function failure(){tone(292,.18,'triangle',.023,0);tone(197,.22,'sine',.021,.115)}
window.RJGlobalSensory={click,success,failure,setEnabled(v){audio.enabled=Boolean(v);try{localStorage.setItem('rj_sound_enabled',String(audio.enabled))}catch(_){}},get enabled(){return audio.enabled}};
function interactive(el){return el?.closest?.('button:not(:disabled),a[href],[role="button"],[role="link"],summary,[onclick],[tabindex="0"],input[type="button"],input[type="submit"],.rj-clickable,.choice,.option')}
document.addEventListener('pointerdown',e=>{if(interactive(e.target))click()},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&interactive(e.target))click()},{capture:true});
/* Detect validated state changes; one sound per feedback event, not each coloured child. */
const good=/(^|\s)(correct|is-correct|answer-correct|rj-success|success)(\s|$)/i;
const bad=/(^|\s)(incorrect|is-incorrect|answer-wrong|wrong|rj-error|error)(\s|$)/i;
const seen=new WeakMap();
function inspect(el){
 if(!(el instanceof HTMLElement))return;
 if(!el.matches('button,[role="option"],.choice,.option,.feedback,[aria-live],.quiz-answer,.answer'))return;
 const classes=String(el.className||'');let state=bad.test(classes)?'error':good.test(classes)?'success':'';
 if(!state)return;
 if(seen.get(el)===state)return;
 seen.set(el,state);
 let now=performance.now();if(now-audio.lastResult<120)return;audio.lastResult=now;
 state==='success'?success():failure();
}
const observer=new MutationObserver(records=>{
 for(const r of records){
  if(r.type==='attributes'){inspect(r.target);continue}
  for(const node of r.addedNodes){if(!(node instanceof HTMLElement))continue;inspect(node);
   if(node.childElementCount<100)node.querySelectorAll('button.correct,button.incorrect,.choice.correct,.choice.incorrect,.option.correct,.option.incorrect').forEach(inspect)}
 }
});
function begin(){observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})}
if(document.body)begin();else document.addEventListener('DOMContentLoaded',begin,{once:true});
})();