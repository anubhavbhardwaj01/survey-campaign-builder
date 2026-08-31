/// <reference types="vite/client" />
import React, {useMemo, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {AnimatePresence, motion} from 'framer-motion'
import {GripVertical, Plus, Trash2, Undo2, Redo2, Eye, RotateCcw, ChevronDown, ChevronRight, Upload, X, Check, Sparkles, MousePointer2, MoreHorizontal, ExternalLink, Settings2} from 'lucide-react'
import './index.css'

type Option={id:string;text:string}
type Question={id:string;title:string;description:string;options:Option[]}
type Styles={
 bg:string; backdrop:string; backdropOpacity:number; radius:number
 titleColor:string; titleSize:number; titleWeight:number; titleAlign:'left'|'center'|'right'; titleItalic:boolean
 subColor:string; subSize:number; subWeight:number; subAlign:'left'|'center'|'right'
 optionBg:string; optionText:string; optionBorder:string; optionSelectedBg:string; optionSelectedText:string; optionBorderWidth:number; optionRadius:number; optionHeight:number; optionSpacing:number
 commentBg:string; commentText:string; commentBorder:string; commentBorderWidth:number
 ctaBg:string; ctaText:string; ctaBorder:string; ctaBorderWidth:number; ctaRadius:number; ctaHeight:number; ctaWidth:number; ctaFull:boolean
 closeColor:string; closeFill:string; closeStyle:'x'|'minimal'|'circle'|'rounded'; closeSize:number
}
type Survey={name:string;questions:Question[];comments:boolean;thankYou:boolean;thankTitle:string;thankDescription:string;thankButton:string;redirect:string;media?:string;buttonText:string;styles:Styles}

const uid=()=>Math.random().toString(36).slice(2,9)
const initialStyles:Styles={bg:'#ffffff',backdrop:'#111827',backdropOpacity:12,radius:28,titleColor:'#18181b',titleSize:22,titleWeight:700,titleAlign:'left',titleItalic:false,subColor:'#71717a',subSize:14,subWeight:400,subAlign:'left',
optionBg:'#ffffff',optionText:'#27272a',optionBorder:'#e4e4e7',optionSelectedBg:'#18181b',optionSelectedText:'#ffffff',optionBorderWidth:1,optionRadius:14,optionHeight:52,optionSpacing:10,
commentBg:'#fafafa',commentText:'#27272a',commentBorder:'#e4e4e7',commentBorderWidth:1,ctaBg:'#18181b',ctaText:'#ffffff',ctaBorder:'#18181b',ctaBorderWidth:1,ctaRadius:14,ctaHeight:50,ctaWidth:100,ctaFull:true,
closeColor:'#52525b',closeFill:'#ffffff',closeStyle:'circle',closeSize:30}
const makeQ=(n:number):Question=>({id:uid(),title:n===1?'How satisfied are you with our product?':n===2?'What could we improve?':`Question ${n}`,description:n===1?'Your feedback helps us build a better experience.':'Tell us what you think.',options:n===1?['Very satisfied','Satisfied','Neutral','Dissatisfied','Very dissatisfied'].map(text=>({id:uid(),text})):['Yes','Maybe','No'].map(text=>({id:uid(),text}))})
const initial:Survey={name:'Help us improve your experience',questions:[makeQ(1),makeQ(2)],comments:true,thankYou:true,thankTitle:'Thanks for your feedback!',thankDescription:'Your response has been recorded. We appreciate you taking the time.',thankButton:'Done',redirect:'No redirect',buttonText:'Continue',styles:initialStyles}

function App(){
 const [survey,setSurvey]=useState<Survey>(initial)
 const [tab,setTab]=useState<'Content'|'Styling'>('Content')
 const [selected,setSelected]=useState(0)
 const [preview,setPreview]=useState<'mobile'|'desktop'>('mobile')
 const [previewStep,setPreviewStep]=useState(0)
 const [open,setOpen]=useState<Record<string,boolean>>({appearance:true,typography:true,options:true,comments:true,cta:true,close:true,thank:true})
 const [history,setHistory]=useState<Survey[]>([])
 const [future,setFuture]=useState<Survey[]>([])
 const update=(fn:(s:Survey)=>Survey)=>{setSurvey(s=>{setHistory(h=>[...h.slice(-19),s]);setFuture([]);return fn(s)})}
 const patchStyle=(p:Partial<Styles>)=>update(s=>({...s,styles:{...s.styles,...p}}))
 const q=survey.questions[selected]
 const addQ=()=>update(s=>({...s,questions:[...s.questions,makeQ(s.questions.length+1)]}))
 const removeQ=(i:number)=>{if(survey.questions.length<=1)return;update(s=>({...s,questions:s.questions.filter((_,x)=>x!==i)}));setSelected(Math.max(0,Math.min(selected,survey.questions.length-2)))}
 const addOption=(qi:number)=>update(s=>({...s,questions:s.questions.map((x,i)=>i===qi?{...x,options:[...x.options,{id:uid(),text:'New option'}]}:x)}))
 const updateQ=(qi:number,p:Partial<Question>)=>update(s=>({...s,questions:s.questions.map((x,i)=>i===qi?{...x,...p}:x)}))
 const updateOption=(qi:number,oi:number,text:string)=>update(s=>({...s,questions:s.questions.map((x,i)=>i===qi?{...x,options:x.options.map((o,j)=>j===oi?{...o,text}:o)}:x)}))
 const undo=()=>{if(!history.length)return;const prev=history[history.length-1];setFuture(f=>[survey,...f]);setHistory(history.slice(0,-1));setSurvey(prev)}
 const redo=()=>{if(!future.length)return;const next=future[future.length-1];setHistory(h=>[...h,survey]);setFuture(future.slice(0,-1));setSurvey(next)}
 const toggle=(key:string)=>setOpen(o=>({...o,[key]:!o[key]}))
 const resetPreview=()=>setPreviewStep(0)
 const selectedQ=q||survey.questions[0]

 return <div className="h-screen overflow-hidden bg-[#f6f6f4] text-zinc-900">
  <header className="h-[68px] border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl flex items-center justify-between px-5">
   <div className="flex items-center gap-3 min-w-[280px]">
    <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white grid place-items-center shadow-sm"><Sparkles size={17}/></div>
    <div><div className="font-semibold tracking-tight">Survey Builder</div><div className="text-[11px] text-zinc-500 flex items-center gap-1.5"><span>{survey.name}</span><span className="px-1.5 py-0.5 rounded-md bg-zinc-100">Draft</span></div></div>
   </div>
   <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
    {(['Content','Styling'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-6 py-2 rounded-lg text-sm font-medium transition ${tab===t?'bg-white shadow-sm':'text-zinc-500 hover:text-zinc-900'}`}>{t}</button>)}
   </div>
   <div className="flex items-center gap-1.5 min-w-[280px] justify-end">
    <button onClick={undo} title="Undo" className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"><Undo2 size={17}/></button>
    <button onClick={redo} title="Redo" className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"><Redo2 size={17}/></button>
    <button onClick={()=>setPreview(p=>p==='mobile'?'desktop':'mobile')} className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100 text-sm"><Eye size={16}/> Preview</button>
    <button onClick={()=>alert('Campaign published successfully.')} className="ml-1 px-4 py-2 rounded-lg bg-zinc-950 text-white text-sm font-medium shadow-sm hover:bg-zinc-800 transition">Publish</button>
    <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-400 grid place-items-center text-xs font-semibold">AB</div>
   </div>
  </header>

  <div className="h-[calc(100vh-68px)] grid grid-cols-[270px_minmax(430px,1fr)_minmax(430px,45%)]">
   <aside className="border-r border-zinc-200 bg-white overflow-y-auto p-4">
    <div className="text-[10px] font-semibold tracking-[.16em] text-zinc-400 mb-3">{tab.toUpperCase()}</div>
    <div className="space-y-1">
     <SideItem label="Introduction" active={selected===-1} onClick={()=>setSelected(-1)}/>
     {survey.questions.map((x,i)=><SideItem key={x.id} label={`Question ${i+1}`} active={selected===i} onClick={()=>setSelected(i)} number={i+1}/>)}
     <SideItem label="Thank You" active={selected===-2} onClick={()=>setSelected(-2)}/>
    </div>
    <button onClick={addQ} className="mt-4 w-full border border-dashed border-zinc-300 rounded-xl py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-400 transition flex items-center justify-center gap-2"><Plus size={15}/> Add Question</button>
    <div className="mt-8 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
      <div className="flex items-center gap-2 text-xs font-semibold"><MousePointer2 size={14}/> Tip</div>
      <p className="text-[11px] leading-4 text-zinc-500 mt-1">Everything you edit here is reflected in the preview instantly.</p>
    </div>
   </aside>

   <main className="overflow-y-auto p-7 lg:p-9">
    <div className="max-w-2xl mx-auto">
     <div className="flex items-end justify-between mb-7"><div><div className="text-xs text-zinc-400 mb-1">{tab} / {selected===-2?'Thank You':selected===-1?'Introduction':`Question ${selected+1}`}</div><h1 className="text-2xl font-semibold tracking-tight">{selected===-2?'Thank You Page':selected===-1?'Survey Introduction':`Question ${selected+1}`}</h1></div><div className="text-xs text-zinc-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> All changes saved</div></div>
     {tab==='Content'?<ContentEditor survey={survey} q={selectedQ} selected={selected} update={update} updateQ={updateQ} updateOption={updateOption} addOption={addOption} removeQ={removeQ}/>:<StylingEditor styles={survey.styles} open={open} toggle={toggle} patchStyle={patchStyle} survey={survey} update={update}/>}
    </div>
   </main>

   <section className="border-l border-zinc-200 bg-[#ecece9] relative overflow-hidden">
    <div className="absolute inset-0 opacity-40" style={{backgroundImage:'radial-gradient(#a1a1aa 0.7px, transparent 0.7px)',backgroundSize:'18px 18px'}}/>
    <div className="relative h-full flex flex-col items-center">
      <div className="w-full h-14 flex items-center justify-between px-5">
       <div className="flex items-center gap-2 text-sm font-semibold"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Live Preview</div>
       <div className="flex items-center gap-1 bg-white/80 rounded-lg p-1 border border-zinc-200">
        <button onClick={()=>setPreview('mobile')} className={`px-2.5 py-1 rounded-md text-[11px] ${preview==='mobile'?'bg-zinc-900 text-white':'text-zinc-500'}`}>Mobile</button>
        <button onClick={()=>setPreview('desktop')} className={`px-2.5 py-1 rounded-md text-[11px] ${preview==='desktop'?'bg-zinc-900 text-white':'text-zinc-500'}`}>Desktop</button>
        <button onClick={resetPreview} className="p-1 text-zinc-500 hover:text-zinc-900"><RotateCcw size={13}/></button>
       </div>
      </div>
      <div className="flex-1 w-full overflow-auto flex items-center justify-center p-6">
       <PhoneFrame mode={preview} survey={survey} step={previewStep} setStep={setPreviewStep}/>
      </div>
    </div>
   </section>
  </div>
 </div>
}

function SideItem({label,active,onClick,number}:{label:string;active:boolean;onClick:()=>void;number?:number}){return <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition ${active?'bg-zinc-100 text-zinc-950':'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}><GripVertical size={14} className="text-zinc-300"/>{number?<span className="w-5 h-5 rounded-md bg-white border border-zinc-200 grid place-items-center text-[10px]">{number}</span>:<span className="w-5"/>}<span className="text-sm truncate">{label}</span></button>}

function ContentEditor({survey,q,selected,update,updateQ,updateOption,addOption,removeQ}:{survey:Survey;q:Question;selected:number;update:(fn:(s:Survey)=>Survey)=>void;updateQ:(i:number,p:Partial<Question>)=>void;updateOption:(qi:number,oi:number,t:string)=>void;addOption:(i:number)=>void;removeQ:(i:number)=>void}){
 if(selected===-1)return <div className="space-y-5"><Card title="Campaign name"><Input value={survey.name} onChange={v=>update(s=>({...s,name:v}))}/></Card><Card title="Number of survey questions"><div className="flex items-center gap-3"><button onClick={()=>update(s=>({...s,questions:s.questions.slice(0,-1)}))} disabled={survey.questions.length<=1} className="w-10 h-10 rounded-xl border bg-white disabled:opacity-40">−</button><div className="w-16 text-center text-xl font-semibold">{survey.questions.length}</div><button onClick={()=>update(s=>({...s,questions:[...s.questions,makeQ(s.questions.length+1)]}))} className="w-10 h-10 rounded-xl border bg-white">+</button></div><p className="text-xs text-zinc-500 mt-3">Questions are created and removed dynamically while preserving the shared preview state.</p></Card><Card title="Additional comments"><Toggle checked={survey.comments} onChange={v=>update(s=>({...s,comments:v}))} label="Allow additional comments"/></Card><LogicBuilder/></div>
 if(selected===-2)return <div className="space-y-5"><Card title="Thank You Page"><Toggle checked={survey.thankYou} onChange={v=>update(s=>({...s,thankYou:v}))} label="Enable Thank You Page"/></Card>{survey.thankYou&&<><Card title="Media"><label className="border border-dashed border-zinc-300 rounded-2xl p-7 flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 cursor-pointer"><Upload size={19}/><span className="text-sm font-medium">Drop media or choose a file</span><span className="text-[11px] text-zinc-400">PNG, JPG, JPEG, GIF, Lottie</span><input type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)update(s=>({...s,media:URL.createObjectURL(f)}))}}/></label>{survey.media&&<div className="mt-3 flex items-center gap-3 p-2 border rounded-xl"><img src={survey.media} className="w-12 h-12 rounded-lg object-cover"/><span className="text-xs flex-1">Uploaded media</span><button onClick={()=>update(s=>({...s,media:undefined}))}><X size={15}/></button></div>}</Card><Card title="Thank You Content"><div className="space-y-4"><Field label="Title"><Input value={survey.thankTitle} onChange={v=>update(s=>({...s,thankTitle:v}))}/></Field><Field label="Description"><textarea value={survey.thankDescription} onChange={e=>update(s=>({...s,thankDescription:e.target.value}))} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 min-h-24"/></Field><Field label="CTA Button Text"><Input value={survey.thankButton} onChange={v=>update(s=>({...s,thankButton:v}))}/></Field><Field label="Redirect"><select value={survey.redirect} onChange={e=>update(s=>({...s,redirect:e.target.value}))} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm"><option>No redirect</option><option>URL</option></select></Field></div></Card></>}</div>
 return <div className="space-y-5"><Card title="Question title"><Input value={q.title} onChange={v=>updateQ(selected,{title:v})}/></Card><Card title="Description"><textarea value={q.description} onChange={e=>updateQ(selected,{description:e.target.value})} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 min-h-24"/></Card><Card title="Options"><div className="space-y-2">{q.options.map((o,i)=><div key={o.id} className="flex items-center gap-2 group"><GripVertical size={15} className="text-zinc-300"/><div className="w-7 h-7 rounded-lg border border-zinc-200 grid place-items-center"><span className="w-3 h-3 rounded-full border border-zinc-400"/></div><input value={o.text} onChange={e=>updateOption(selected,i,e.target.value)} className="flex-1 bg-transparent border-b border-zinc-200 focus:border-zinc-900 outline-none py-2 text-sm"/><button disabled={q.options.length<=2} onClick={()=>update(s=>({...s,questions:s.questions.map((x,qi)=>qi===selected?{...x,options:x.options.filter((_,oi)=>oi!==i)}:x)}))} className="p-1.5 text-zinc-300 hover:text-red-500 disabled:opacity-20"><Trash2 size={15}/></button></div>)}</div><button onClick={()=>addOption(selected)} className="mt-4 text-sm font-medium flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950"><Plus size={15}/> Add option</button><p className="text-[11px] text-zinc-400 mt-2">Minimum 2 options. Unlimited options supported.</p></Card><Card title="Additional comments"><Toggle checked={survey.comments} onChange={v=>update(s=>({...s,comments:v}))} label="Allow additional comments"/></Card><Card title="Submit button"><Field label="Button text"><Input value={survey.buttonText} onChange={v=>update(s=>({...s,buttonText:v}))}/></Field></Card><LogicBuilder/><button onClick={()=>removeQ(selected)} className="w-full py-3 rounded-xl text-sm text-red-500 hover:bg-red-50">Delete this question</button></div>
}

function StylingEditor({styles,open,toggle,patchStyle,survey,update}:{styles:Styles;open:Record<string,boolean>;toggle:(x:string)=>void;patchStyle:(p:Partial<Styles>)=>void;survey:Survey;update:(fn:(s:Survey)=>Survey)=>void}){
 const section=(key:string,title:string,body:React.ReactNode)=><div className="border-b border-zinc-200 py-2"><button onClick={()=>toggle(key)} className="w-full flex items-center justify-between py-3 text-sm font-semibold">{title}{open[key]?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>{open[key]&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="pb-4">{body}</motion.div>}</div>
 return <div className="space-y-1">{section('appearance','Appearance',<div className="grid grid-cols-2 gap-4"><Color label="Background" value={styles.bg} set={(v: string) => patchStyle({bg:v})}/><Color label="Backdrop" value={styles.backdrop} set={(v: string)=>patchStyle({backdrop:v})}/><Range label="Corner radius" value={styles.radius} min={0} max={48} set={(v: number)=>patchStyle({radius:v})}/><Range label="Backdrop opacity" value={styles.backdropOpacity} min={0} max={70} set={(v: number)=>patchStyle({backdropOpacity:v})}/></div>)}{section('typography','Question title',<Typography title="Title" color={styles.titleColor} setColor={(v: string)=>patchStyle({titleColor:v})} size={styles.titleSize} setSize={(v: number)=>patchStyle({titleSize:v})} weight={styles.titleWeight} setWeight={(v: number)=>patchStyle({titleWeight:v})} align={styles.titleAlign} setAlign={(v: Styles['titleAlign'])=>patchStyle({titleAlign:v})} italic={styles.titleItalic} setItalic={(v: boolean)=>patchStyle({titleItalic:v})}/>)}{section('subtitle','Subtitle',<Typography title="Subtitle" color={styles.subColor} setColor={(v: string)=>patchStyle({subColor:v})} size={styles.subSize} setSize={(v: number)=>patchStyle({subSize:v})} weight={styles.subWeight} setWeight={(v: number)=>patchStyle({subWeight:v})} align={styles.subAlign} setAlign={(v: Styles['subAlign'])=>patchStyle({subAlign:v})}/>)}{section('options','Option list',<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><Color label="Option background" value={styles.optionBg} set={(v: string)=>patchStyle({optionBg:v})}/><Color label="Option text" value={styles.optionText} set={(v: string)=>patchStyle({optionText:v})}/><Color label="Border" value={styles.optionBorder} set={(v: string)=>patchStyle({optionBorder:v})}/><Color label="Selected background" value={styles.optionSelectedBg} set={(v: string)=>patchStyle({optionSelectedBg:v})}/><Color label="Selected text" value={styles.optionSelectedText} set={(v: string)=>patchStyle({optionSelectedText:v})}/><Range label="Border width" value={styles.optionBorderWidth} min={0} max={4} set={(v: number)=>patchStyle({optionBorderWidth:v})}/><Range label="Height" value={styles.optionHeight} min={38} max={72} set={(v: number)=>patchStyle({optionHeight:v})}/><Range label="Spacing" value={styles.optionSpacing} min={4} max={24} set={(v: number)=>patchStyle({optionSpacing:v})}/><Range label="Corner radius" value={styles.optionRadius} min={0} max={28} set={(v: number)=>patchStyle({optionRadius:v})}/></div></div>)}{section('comments','Comment field',<div className="grid grid-cols-2 gap-3"><Color label="Background" value={styles.commentBg} set={(v: string)=>patchStyle({commentBg:v})}/><Color label="Text" value={styles.commentText} set={(v: string)=>patchStyle({commentText:v})}/><Color label="Border" value={styles.commentBorder} set={(v: string)=>patchStyle({commentBorder:v})}/><Range label="Border width" value={styles.commentBorderWidth} min={0} max={4} set={(v: number)=>patchStyle({commentBorderWidth:v})}/></div>)}{section('cta','CTA Button',<div className="grid grid-cols-2 gap-3"><Color label="Background" value={styles.ctaBg} set={(v: string)=>patchStyle({ctaBg:v})}/><Color label="Text" value={styles.ctaText} set={(v: string)=>patchStyle({ctaText:v})}/><Color label="Border" value={styles.ctaBorder} set={(v: string)=>patchStyle({ctaBorder:v})}/><Range label="Border width" value={styles.ctaBorderWidth} min={0} max={4} set={(v: number)=>patchStyle({ctaBorderWidth:v})}/><Range label="Height" value={styles.ctaHeight} min={38} max={72} set={(v: number)=>patchStyle({ctaHeight:v})}/><Range label="Radius" value={styles.ctaRadius} min={0} max={28} set={(v: number)=>patchStyle({ctaRadius:v})}/><Range label="Width %" value={styles.ctaWidth} min={30} max={100} set={(v: number)=>patchStyle({ctaWidth:v})}/><div className="col-span-2"><Toggle checked={styles.ctaFull} onChange={(v:boolean)=>patchStyle({ctaFull:v})} label="Full width"/></div></div>)}{section('close','Cross / Close button',<div className="grid grid-cols-2 gap-3"><Color label="Cross" value={styles.closeColor} set={(v: string)=>patchStyle({closeColor:v})}/><Color label="Fill" value={styles.closeFill} set={(v: string)=>patchStyle({closeFill:v})}/><Range label="Size" value={styles.closeSize} min={20} max={44} set={(v: number)=>patchStyle({closeSize:v})}/><div><label className="text-[11px] text-zinc-500">Style</label><select value={styles.closeStyle} onChange={e=>patchStyle({closeStyle:e.target.value as Styles['closeStyle']})} className="w-full mt-1 border rounded-lg p-2 text-xs bg-zinc-50"><option value="x">X</option><option value="minimal">Minimal X</option><option value="circle">Circle X</option><option value="rounded">Rounded X</option></select></div></div>)}{section('thank','Thank You styling',<div className="space-y-3"><p className="text-xs text-zinc-500">The Thank You page uses the same live canvas. Content controls are available under the Thank You section.</p><Color label="Title color" value={styles.titleColor} set={v=>patchStyle({titleColor:v})}/><Range label="Image width" value={80} min={30} max={100} set={()=>{}}/></div>)}</div>
}

type TypographyProps = {
 title:string; color:string; setColor:(v:string)=>void; size:number; setSize:(v:number)=>void;
 weight:number; setWeight:(v:number)=>void; align:Styles['titleAlign'] | Styles['subAlign'];
 setAlign:(v:Styles['titleAlign'] | Styles['subAlign'])=>void; italic?:boolean; setItalic?:(v:boolean)=>void;
}
function Typography({title,color,setColor,size,setSize,weight,setWeight,align,setAlign,italic=false,setItalic=()=>{}}:TypographyProps){return <div className="space-y-4"><div className="grid grid-cols-2 gap-3"><Color label="Color" value={color} set={setColor}/><Range label="Size" value={size} min={10} max={48} set={setSize}/></div><div className="grid grid-cols-2 gap-3"><div><label className="text-[11px] text-zinc-500">Weight</label><select value={weight} onChange={e=>setWeight(+e.target.value)} className="w-full mt-1 border rounded-lg p-2 text-xs bg-zinc-50"><option value={400}>Regular</option><option value={500}>Medium</option><option value={600}>Semibold</option><option value={700}>Bold</option><option value={800}>Extra bold</option></select></div><div><label className="text-[11px] text-zinc-500">Alignment</label><select value={align} onChange={e=>setAlign(e.target.value as Styles['titleAlign'] | Styles['subAlign'])} className="w-full mt-1 border rounded-lg p-2 text-xs bg-zinc-50"><option>left</option><option>center</option><option>right</option></select></div></div>{setItalic&&<Toggle checked={italic} onChange={setItalic} label="Italic"/>}</div>}
function PhoneFrame({mode,survey,step,setStep}:{mode:'mobile'|'desktop';survey:Survey;step:number;setStep:(n:number)=>void}){
 const s=survey.styles, isThank=step>=survey.questions.length
 const phoneWidth=mode==='mobile'?360:620
 return <div className={`${mode==='mobile'?'w-[360px]':'w-[620px]'} transition-all duration-300`}>
  <div className="mx-auto rounded-[42px] bg-zinc-950 p-[10px] shadow-2xl shadow-zinc-900/30">
   <div className="relative overflow-hidden rounded-[34px] bg-white h-[690px]">
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-950 rounded-full z-10"/>
    <div className="h-full overflow-y-auto phone-scroll" style={{background:s.bg,borderRadius:s.radius}}>
     <div className="min-h-full p-7 pt-12 flex flex-col">
      <button className={`self-end grid place-items-center mb-8`} style={{width:s.closeSize,height:s.closeSize,color:s.closeColor,background:s.closeStyle==='circle'?s.closeFill:'transparent',borderRadius:s.closeStyle==='rounded'?10:999}}><X size={16}/></button>
      <AnimatePresence mode="wait">
       {isThank?<motion.div key="thank" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="flex-1 flex flex-col justify-center text-center items-center">
         {survey.media&&<img src={survey.media} className="w-24 h-24 object-cover rounded-2xl mb-6 shadow-sm"/>}
         <h2 style={{color:s.titleColor,fontSize:s.titleSize,fontWeight:s.titleWeight,textAlign:s.titleAlign as any}}>{survey.thankTitle}</h2>
         <p className="mt-3 leading-6" style={{color:s.subColor,fontSize:s.subSize,textAlign:s.subAlign as any}}>{survey.thankDescription}</p>
         <button onClick={()=>setStep(0)} className="mt-8 px-7" style={{height:s.ctaHeight,width:s.ctaFull?'100%':`${s.ctaWidth}%`,background:s.ctaBg,color:s.ctaText,border:`${s.ctaBorderWidth}px solid ${s.ctaBorder}`,borderRadius:s.ctaRadius}}>{survey.thankButton}</button>
       </motion.div>:<motion.div key={step} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-12}} className="flex-1">
         <div className="text-[10px] uppercase tracking-[.16em] text-zinc-400 mb-3">Question {step+1} of {survey.questions.length}</div>
         <h2 style={{color:s.titleColor,fontSize:s.titleSize,fontWeight:s.titleWeight,textAlign:s.titleAlign as any,fontStyle:s.titleItalic?'italic':'normal'}}>{survey.questions[step].title}</h2>
         <p className="mt-3 leading-6" style={{color:s.subColor,fontSize:s.subSize,fontWeight:s.subWeight,textAlign:s.subAlign as any}}>{survey.questions[step].description}</p>
         <div className="mt-7 space-y-2.5">{survey.questions[step].options.map((o,i)=><button key={o.id} onClick={()=>{}} className="w-full flex items-center gap-3 px-4 transition hover:translate-y-[-1px]" style={{height:s.optionHeight,color:s.optionText,background:s.optionBg,border:`${s.optionBorderWidth}px solid ${s.optionBorder}`,borderRadius:s.optionRadius,textAlign:'left'}}><span className="w-4 h-4 rounded-full border border-current opacity-50"/><span className="text-sm">{o.text}</span></button>)}</div>
         {survey.comments&&<textarea placeholder="Additional comments (optional)" className="mt-4 w-full min-h-24 p-3 outline-none resize-none text-sm" style={{color:s.commentText,background:s.commentBg,border:`${s.commentBorderWidth}px solid ${s.commentBorder}`,borderRadius:s.optionRadius}}/>}
         <button onClick={()=>setStep(step+1)} className="mt-5 w-full font-medium" style={{height:s.ctaHeight,width:s.ctaFull?'100%':`${s.ctaWidth}%`,background:s.ctaBg,color:s.ctaText,border:`${s.ctaBorderWidth}px solid ${s.ctaBorder}`,borderRadius:s.ctaRadius}}>{step===survey.questions.length-1?'Submit':survey.buttonText}</button>
       </motion.div>}
      </AnimatePresence>
     </div>
    </div>
   </div>
  </div>
  <div className="text-center mt-3 text-[11px] text-zinc-400">Interactive preview • click CTA to advance</div>
 </div>
}
function Card({title,children}:{title:string;children:React.ReactNode}){return <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,.02)]"><h3 className="text-sm font-semibold mb-4">{title}</h3>{children}</div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <div><label className="text-[11px] font-medium text-zinc-500">{label}</label><div className="mt-1">{children}</div></div>}
function Input({value,onChange}:{value:string;onChange:(v:string)=>void}){return <input value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-zinc-200 transition"/>}
function Toggle({checked,onChange,label}:{checked:boolean;onChange:(v:boolean)=>void;label:string}){return <button onClick={()=>onChange(!checked)} className="w-full flex items-center justify-between text-sm"><span>{label}</span><span className={`w-10 h-6 rounded-full p-0.5 transition ${checked?'bg-zinc-900':'bg-zinc-200'}`}><span className={`block w-5 h-5 rounded-full bg-white shadow-sm transition ${checked?'translate-x-4':''}`}/></span></button>}
function Color({label,value,set}:{label:string;value:string;set:(v:string)=>void}){return <Field label={label}><div className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 rounded-lg p-1.5"><input type="color" value={value} onChange={e=>set(e.target.value)} className="w-7 h-7 rounded-md border-0 bg-transparent"/><input value={value} onChange={e=>set(e.target.value)} className="bg-transparent outline-none text-xs w-full uppercase"/></div></Field>}
function Range({label,value,min,max,set}:{label:string;value:number;min:number;max:number;set:(v:number)=>void}){return <Field label={label}><div className="flex items-center gap-2"><input className="range w-full" type="range" min={min} max={max} value={value} onChange={e=>set(+e.target.value)}/><input type="number" value={value} onChange={e=>set(+e.target.value)} className="w-14 border rounded-lg p-1.5 text-xs text-center bg-zinc-50"/></div></Field>}
function LogicBuilder(){return <Card title="Conditional logic"><div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs space-y-2"><div className="font-semibold text-zinc-500">IF</div><div className="bg-white border rounded-lg p-2.5">Question 1</div><div className="font-semibold text-zinc-500">IS</div><div className="bg-white border rounded-lg p-2.5">Very satisfied</div><div className="font-semibold text-zinc-500">THEN</div><div className="bg-white border rounded-lg p-2.5">Redirect to Question 2</div><button className="mt-2 text-xs font-semibold flex items-center gap-1"><Plus size={13}/> Add condition</button></div></Card>}

createRoot(document.getElementById('root')!).render(<App />)
