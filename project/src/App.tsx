import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabase, Item, Rental, ServicesPartner } from "./lib/supabase";

const MODEL = "claude-sonnet-4-20250514";
const T = {
  navy:"#0B1929",navyMid:"#0F2236",navyLight:"#172D45",navyBdr:"#1E3A52",
  emerald:"#00B37E",emeraldLo:"rgba(0,179,126,0.12)",emeraldGl:"rgba(0,179,126,0.06)",
  gold:"#F5A623",goldLo:"rgba(245,166,35,0.12)",rose:"#FF6B8A",roseLo:"rgba(255,107,138,0.12)",
  orange:"#F97316",orangeLo:"rgba(249,115,22,0.12)",
  text:"#E8F0FE",muted:"#7A9BB5",white:"#FFFFFF",red:"#FF5252",MIN:15,PROTECTION_FEE:0.01
};

const CSS=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Outfit:wght@300;400;500;600&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:${T.navy};color:${T.text};font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${T.navy}}::-webkit-scrollbar-thumb{background:${T.navyBdr};border-radius:2px}input[type=range]{-webkit-appearance:none;appearance:none;background:${T.navyBdr};height:4px;border-radius:2px;cursor:pointer;width:100%}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:${T.emerald};box-shadow:0 0 0 4px rgba(0,179,126,0.2)}@keyframes popIn{0%{transform:scale(0.84);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes glow{0%,100%{box-shadow:0 0 6px ${T.emerald}}50%{box-shadow:0 0 22px ${T.emerald}}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.6)}}@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes tOut{to{opacity:0;transform:translateX(-50%) translateY(-12px)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes shimmer{0%{opacity:0.7}50%{opacity:1}100%{opacity:0.7}}@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}.app{max-width:430px;margin:0 auto;min-height:100dvh;background:${T.navy};position:relative;overflow-x:hidden;}.screen{padding-bottom:90px;animation:fadeUp 0.28s ease;}.launch-banner{background:linear-gradient(90deg,${T.emerald},#00D49A,${T.emerald});background-size:200% 100%;animation:shimmer 2s ease-in-out infinite;padding:8px 0;overflow:hidden;position:relative;}.launch-banner-inner{display:flex;gap:40px;white-space:nowrap;animation:marquee 18s linear infinite;width:max-content;}.launch-banner-txt{font-size:11px;font-weight:700;color:${T.navy};letter-spacing:0.8px;text-transform:uppercase;display:flex;align-items:center;gap:8px;}.header{padding:16px 18px 20px;background:linear-gradient(160deg,${T.navyMid} 0%,${T.navy} 100%);border-bottom:1px solid ${T.navyBdr};position:relative;overflow:hidden;}.header::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${T.emerald},${T.gold},transparent);opacity:0.6;}.header-glow{position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(0,179,126,0.12) 0%,transparent 70%);pointer-events:none;}.logo{font-family:'Playfair Display',serif;font-weight:800;font-size:24px;color:${T.white};display:flex;align-items:center;gap:9px;}.logo-dot{width:9px;height:9px;border-radius:50%;background:${T.emerald};flex-shrink:0;animation:glow 2s infinite;}.logo-sub{font-size:11px;color:${T.muted};margin-top:3px;}.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:rgba(11,25,41,0.96);backdrop-filter:blur(16px);border-top:1px solid ${T.navyBdr};display:flex;z-index:200;padding-bottom:env(safe-area-inset-bottom,0);}.nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 4px;background:none;border:none;cursor:pointer;color:${T.muted};font-family:'Outfit',sans-serif;font-size:9px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;transition:color 0.2s;position:relative;}.nav-btn.active{color:${T.emerald};}.nav-btn.active::after{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:26px;height:2px;background:${T.emerald};border-radius:0 0 3px 3px;}.nav-btn svg{width:21px;height:21px;}.card{background:${T.navyMid};border:1px solid ${T.navyBdr};border-radius:18px;padding:18px;margin:0 14px 10px;}.card.em{border-color:rgba(0,179,126,0.3);background:linear-gradient(135deg,rgba(0,179,126,0.07),${T.navyMid});}.card.go{border-color:rgba(245,166,35,0.3);background:linear-gradient(135deg,rgba(245,166,35,0.07),${T.navyMid});}.eyebrow{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${T.muted};margin-bottom:10px;}.card-title{font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:${T.white};}.sec-title{font-family:'Playfair Display',serif;font-weight:800;font-size:20px;color:${T.white};margin:22px 14px 12px;line-height:1.25;}.sec-title em{color:${T.emerald};font-style:normal;}.badge{display:inline-flex;align-items:center;gap:3px;border-radius:20px;padding:2px 8px;font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;}.badge.g{background:${T.emeraldLo};color:${T.emerald};border:1px solid rgba(0,179,126,0.25);}.badge.go{background:${T.goldLo};color:${T.gold};border:1px solid rgba(245,166,35,0.25);}.badge.ro{background:${T.roseLo};color:${T.rose};border:1px solid rgba(255,107,138,0.25);}.bdot{width:5px;height:5px;border-radius:50%;background:currentColor;animation:pulse 1.5s infinite;}.btn{width:100%;padding:15px;border:none;border-radius:14px;font-family:'Outfit',sans-serif;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.2s;letter-spacing:0.2px;}.btn-em{background:${T.emerald};color:${T.navy};}.btn-em:hover,.btn-em:active{filter:brightness(1.08);transform:translateY(-1px);}.btn-em:disabled{background:${T.navyBdr};color:${T.muted};cursor:not-allowed;transform:none;filter:none;}.btn-out{background:transparent;color:${T.muted};border:1px solid ${T.navyBdr};}.btn-out:hover,.btn-out:active{border-color:${T.emerald};color:${T.emerald};}.field{width:100%;background:rgba(0,0,0,0.3);border:1px solid ${T.navyBdr};border-radius:12px;padding:12px 14px;color:${T.text};font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border-color 0.2s;margin-bottom:8px;}.field:focus{border-color:${T.emerald};}.field::placeholder{color:${T.muted};}.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${T.emerald};color:${T.navy};font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;padding:11px 22px;border-radius:40px;z-index:9999;white-space:nowrap;animation:tIn 0.3s ease,tOut 0.3s ease 2.3s forwards;box-shadow:0 8px 24px rgba(0,179,126,0.4);}.seal{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(0,179,126,0.1),rgba(0,179,126,0.04));border:1px solid rgba(0,179,126,0.3);border-radius:14px;padding:12px 14px;flex:1;}.seal-icon{font-size:22px;flex-shrink:0;}.seal-title{font-size:11px;font-weight:700;color:${T.emerald};line-height:1.3;}.seal-desc{font-size:9px;color:${T.muted};margin-top:2px;line-height:1.4;}.stat-card{flex:1;text-align:center;padding:14px 10px;}.stat-value{font-family:'Playfair Display',serif;font-weight:800;font-size:22px;color:${T.emerald};}.stat-label{font-size:10px;color:${T.muted};margin-top:4px;letter-spacing:0.5px;text-transform:uppercase;}.modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:9998;display:flex;align-items:flex-end;justify-content:center;}.modal-content{width:100%;max-width:430px;background:${T.navyMid};border-radius:24px 24px 0 0;padding:20px;max-height:90vh;overflow-y:auto;animation:slideIn 0.3s ease;}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}.modal-title{font-family:'Playfair Display',serif;font-weight:700;font-size:20px;color:${T.white};}.close-btn{background:none;border:none;color:${T.muted};font-size:24px;cursor:pointer;padding:4px 8px;line-height:1;}.close-btn:hover{color:${T.text};}`;

const fmt=(n:number)=>"R$ "+Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});

function LaunchBanner(){
  const msg="🚀 LANÇAMENTO · Taxa ZERO · 🛡️ Proteção Vizinho Incluída · ";
  return(<div className="launch-banner"><div className="launch-banner-inner">{[msg,msg].map((m,i)=>(<div key={i} className="launch-banner-txt">{m}</div>))}</div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function AuthScreen(){
  const {signUp,signIn}=useAuth();
  const [isSignUp,setIsSignUp]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setError("");
    setLoading(true);
    const result=isSignUp?await signUp(email,password,name):await signIn(email,password);
    if(result.error)setError(result.error);
    setLoading(false);
  };

  return(
    <div className="screen">
      <LaunchBanner/>
      <div className="header">
        <div className="header-glow"/>
        <div className="logo"><div className="logo-dot"/>Vizinho Aluga</div>
      </div>
      <div style={{padding:"40px 18px"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:28,color:T.white,marginBottom:8}}>Bem-vindo!</div>
          <div style={{fontSize:14,color:T.muted}}>Alugue com segurança total. Ganhe com seus itens.</div>
        </div>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          {isSignUp&&(<input type="text" className="field" placeholder="Seu nome completo" value={name} onChange={e=>setName(e.target.value)} required/>)}
          <input type="email" className="field" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <input type="password" className="field" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} required/>
          {error&&<div style={{background:"rgba(255,82,82,0.1)",border:`1px solid ${T.red}`,borderRadius:10,padding:10,fontSize:12,color:T.red}}>{error}</div>}
          <button type="submit" className="btn btn-em" disabled={loading}>{loading?"Carregando...":isSignUp?"Criar conta":"Entrar"}</button>
        </form>
        <div style={{textAlign:"center",marginTop:20}}>
          <button style={{background:"none",border:"none",color:T.emerald,cursor:"pointer",fontSize:14,fontWeight:600}} onClick={()=>{setIsSignUp(!isSignUp);setError("");}}>
            {isSignUp?"Já tem conta? Entrar":"Não tem conta? Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function HomeScreen({onNavigate}:{onNavigate:(tab:string)=>void}){
  const {user}=useAuth();
  const [stats,setStats]=useState({total_earned:0,total_rentals:0,total_items:0});

  useEffect(()=>{
    if(user)fetchStats();
  },[user]);

  const fetchStats=async()=>{
    if(!user)return;
    const {data:items}=await supabase.from("items").select("id").eq("user_id",user.id);
    const {data:rentals}=await supabase.from("rentals").select("total_amount").eq("owner_id",user.id).eq("status","completed");
    const total=(rentals||[]).reduce((sum:number,r:any)=>sum+Number(r.total_amount||0),0);
    setStats({total_earned:total,total_rentals:rentals?.length||0,total_items:items?.length||0});
  };

  if(!user)return null;

  return(
    <div className="screen">
      <LaunchBanner/>
      <div className="header">
        <div className="header-glow"/>
        <div className="logo"><div className="logo-dot"/>Vizinho Aluga</div>
        <div className="logo-sub">{user.location||"São José do Rio Preto"} · Bem-vindo, {user.full_name?.split(' ')[0]}!</div>
      </div>

      <div style={{margin:"16px 14px 0",background:`linear-gradient(135deg,${T.emeraldLo},${T.emeraldGl})`,border:"1px solid rgba(0,179,126,0.2)",borderRadius:22,padding:"22px 20px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,179,126,0.12) 0%,transparent 70%)"}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:20,lineHeight:1.3,color:T.white,marginBottom:10}}>Aquela furadeira parada no seu armário pode <span style={{color:T.emerald}}>pagar sua pizza</span></div>
        <button className="btn btn-em" onClick={()=>onNavigate("announce")} style={{marginBottom:8}}>Anunciar meu item →</button>
        <button className="btn btn-out" onClick={()=>onNavigate("browse")}>Ver itens próximos</button>
      </div>

      <div style={{padding:"16px 14px 8px"}}>
        <div className="eyebrow">Seu Resumo</div>
        <div style={{display:"flex",gap:8}}>
          <div className="card" style={{flex:1,textAlign:"center"}}>
            <div className="stat-value">{fmt(stats.total_earned)}</div>
            <div className="stat-label">Total Ganho</div>
          </div>
          <div className="card go" style={{flex:1,textAlign:"center"}}>
            <div className="stat-value" style={{color:T.gold}}>{stats.total_items}</div>
            <div className="stat-label">Itens Anunciados</div>
          </div>
        </div>
      </div>

      <div className="card em" style={{margin:"0 14px 10px"}}>
        <div className="eyebrow">🛡️ Proteção Vizinho Ativa</div>
        <div style={{fontSize:12,color:T.muted,lineHeight:1.5}}>
          Todos os aluguéis incluem seguro de 1% automático. Cobertura contra danos, atrasos e item não devolvido.
          <span style={{color:T.emerald,fontWeight:600}}> Até R$500 por item.</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANNOUNCE SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function AnnounceScreen({onSuccess}:{onSuccess:()=>void}){
  const {user,updateProfile}=useAuth();
  const [name,setName]=useState("");
  const [price,setPrice]=useState(String(T.MIN));
  const [category,setCategory]=useState("tools");
  const [emoji,setEmoji]=useState("📦");
  const [cep,setCep]=useState(user?.cep||"");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!user)return;
    setLoading(true);
    setError("");

    const {error:dbError}=await supabase.from("items").insert({
      user_id:user.id,
      name,
      category,
      emoji,
      price_per_day:Number(price),
      available:true,
      insured:true,
      insurance_coverage:500,
      cep
    });

    if(dbError){
      setError(dbError.message);
    }else{
      onSuccess();
    }
    setLoading(false);
  };

  return(
    <div className="screen">
      <LaunchBanner/>
      <div className="header">
        <div className="header-glow"/>
        <div className="logo"><div className="logo-dot"/>Anunciar Item</div>
      </div>

      <div style={{padding:"20px 14px"}}>
        <div className="card em" style={{margin:"0 0 20px"}}>
          <div className="eyebrow">🛡️ Proteção Inclusa</div>
          <div style={{fontSize:13,color:T.white,lineHeight:1.5}}>
            Seu item automaticamente protegido com cobertura até R$500. Taxa de 1% paga pelo locatário.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="text" className="field" placeholder="Nome do item (ex: Furadeira Bosch 18V)" value={name} onChange={e=>setName(e.target.value)} required/>
          <select className="field" style={{cursor:"pointer"}} value={category} onChange={e=>{setCategory(e.target.value);setEmoji(e.target.value==="tools"?"🔧":e.target.value==="elec"?"📺":e.target.value==="leisure"?"⚽":"👗");}}>
            <option value="tools">🔧 Ferramentas</option>
            <option value="elec">📺 Eletrônicos</option>
            <option value="leisure">⚽ Lazer</option>
            <option value="clothes">👗 Vestuário</option>
          </select>
          <input type="text" className="field" placeholder="Emojis (ex: 🔧)" value={emoji} onChange={e=>setEmoji(e.target.value)} maxLength={4} style={{textAlign:"center",fontSize:24}}/>
          <input type="number" className="field" placeholder={`Preço por dia (mín. ${T.MIN})`} value={price} onChange={e=>setPrice(e.target.value)} min={T.MIN}/>
          <input type="text" className="field" placeholder="CEP (ex: 15015-000)" value={cep} onChange={e=>setCep(e.target.value)} maxLength={9}/>

          <div style={{fontSize:11,color:T.muted,textAlign:"center",padding:"8px 0"}}>
            Taxa plataforma: 15% · Seguro: 1% (locatário) · Você recebe: 84%
          </div>

          {error&&<div style={{background:"rgba(255,82,82,0.1)",border:`1px solid ${T.red}`,borderRadius:10,padding:10,fontSize:12,color:T.red}}>{error}</div>}
          <button type="submit" className="btn btn-em" disabled={loading}>{loading?"Publicando...":"📦 Publicar anúncio"}</button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BROWSE SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function BrowseScreen({onRent}:{onRent:(item:Item)=>void}){
  const [items,setItems]=useState<Item[]>([]);
  const {user}=useAuth();

  useEffect(()=>{fetchItems();},[]);
  const fetchItems=async()=>{
    const {data}=await supabase.from("items").select("*").eq("available",true);
    if(data)setItems(data);
  };

  return(
    <div className="screen">
      <LaunchBanner/>
      <div className="header">
        <div className="header-glow"/>
        <div className="logo"><div className="logo-dot"/>Catálogo</div>
        <div className="logo-sub">{items.length} itens disponíveis · Rio Preto/Olímpia</div>
      </div>
      {items.filter(i=>i.user_id!==user?.id).length===0?(
        <div style={{padding:40,textAlign:"center",color:T.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>📦</div>
          <div style={{fontSize:14}}>Nenhum item disponível ainda</div>
          <div style={{fontSize:12,marginTop:8}}>Seja o primeiro a anunciar!</div>
        </div>
      ):items.filter(i=>i.user_id!==user?.id).map(item=>(
        <div key={item.id} style={{display:"flex",background:T.navyMid,border:`1px solid ${T.navyBdr}`,borderRadius:18,overflow:"hidden",margin:"10px 14px",cursor:"pointer"}} onClick={()=>onRent(item)}>
          <div style={{width:88,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,background:T.navyLight}}>{item.emoji}</div>
          <div style={{flex:1,padding:13}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:T.white}}>{item.name}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{item.cep||"Rio Preto"}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:7}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:20,color:T.emerald}}>{fmt(item.price_per_day)}</span>
              <span style={{fontSize:11,color:T.muted}}>/dia</span>
              {item.insured&&<span className="badge g">🛡️ Proteção</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RENTAL CHECKOUT MODAL
// ═══════════════════════════════════════════════════════════════════════════
function RentalCheckout({item,onClose,onSuccess}:{item:Item;onClose:()=>void;onSuccess:()=>void}){
  const {user}=useAuth();
  const [days,setDays]=useState(1);
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(1);
  const [coords,setCoords]=useState<{lat:number;lng:number}|null>(null);
  const [photo,setPhoto]=useState<string|null>(null);

  const basePrice=item.price_per_day*days;
  const protectionFee=basePrice*T.PROTECTION_FEE;
  const platformFee=basePrice*0.15;
  const total=basePrice+protectionFee+platformFee;

  const handleGetLocation=()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        setCoords({lat:pos.coords.latitude,lng:pos.coords.longitude});
        setStep(2);
      });
    }
  };

  const handleSubmit=async()=>{
    if(!user||!coords)return;
    setLoading(true);

    const split_data={
      total,
      platform_fee:platformFee,
      insurance_fee:protectionFee,
      owner_payout:basePrice,
      days
    };

    const {error}=await supabase.from("rentals").insert({
      item_id:item.id,
      owner_id:item.user_id,
      renter_id:user.id,
      start_date:new Date().toISOString().split('T')[0],
      end_date:new Date(Date.now()+days*86400000).toISOString().split('T')[0],
      rental_price:basePrice,
      insurance_fee:protectionFee,
      platform_fee:platformFee,
      total_amount:total,
      insurance_status:"active",
      delivery_lat:coords.lat,
      delivery_lng:coords.lng,
      split_data,
      status:"pending",
      payment_status:"pending"
    });

    setLoading(false);
    if(!error)onSuccess();
  };

  return(
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Alugar {item.name}</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {step===1&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{fontSize:36}}>{item.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16}}>{item.name}</div>
                <div style={{fontSize:12,color:T.muted}}>{item.cep}</div>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:T.muted,display:"block",marginBottom:8}}>Quantos dias?</label>
              <input type="range" min="1" max="7" value={days} onChange={e=>setDays(Number(e.target.value))} style={{width:"100%"}}/>
              <div style={{textAlign:"center",fontSize:20,fontWeight:700,color:T.white,marginTop:8}}>{days} dia{days>1?"s":""}</div>
            </div>

            <div style={{background:T.navyLight,borderRadius:12,padding:12,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                <span style={{color:T.muted}}>Aluguel ({days} dias)</span>
                <span>{fmt(basePrice)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                <span style={{color:T.muted}}>🛡️ Proteção Vizinho (1%)</span>
                <span>{fmt(protectionFee)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                <span style={{color:T.muted}}>Taxa plataforma (15%)</span>
                <span>{fmt(platformFee)}</span>
              </div>
              <div style={{borderTop:`1px solid ${T.navyBdr}`,margin:"8px 0",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700}}>
                <span>Total</span>
                <span style={{color:T.emerald}}>{fmt(total)}</span>
              </div>
            </div>

            <div className="card em" style={{margin:"0 0 16px",padding:12}}>
              <div style={{fontSize:12,color:T.white,lineHeight:1.4}}>
                ✅ Cobertura até R$500 contra danos<br/>
                ✅ Proteção contra atraso na devolução<br/>
                ✅ Foto GPS obrigatória na entrega
              </div>
            </div>

            <button className="btn btn-em" onClick={handleGetLocation}>Continuar →</button>
          </div>
        )}

        {step===2&&(
          <div>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:48,marginBottom:12}}>📍</div>
              <div style={{fontSize:16,fontWeight:600,color:T.white}}>Localização capturada!</div>
              <div style={{fontSize:12,color:T.muted,marginTop:4}}>Lat: {coords?.lat.toFixed(4)} · Lng: {coords?.lng.toFixed(4)}</div>
            </div>

            <div className="card go" style={{margin:"0 0 16px"}}>
              <div style={{fontSize:12,fontWeight:600,color:T.gold,marginBottom:4}}>⚠️ Importante</div>
              <div style={{fontSize:11,color:T.muted,lineHeight:1.5}}>
                Sua localização será registrada como evidência de entrega. O locador receberá as coordenadas e você receberá confirmação com foto.
              </div>
            </div>

            <div style={{fontSize:12,color:T.muted,marginBottom:16,textAlign:"center"}}>
              Ao confirmar, você concorda com nossos <a href="#termos" style={{color:T.emerald}}>Termos do Locatário</a>
            </div>

            <button className="btn btn-em" onClick={handleSubmit} disabled={loading}>
              {loading?"Processando...":`Confirmar Aluguel - ${fmt(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function DashboardScreen(){
  const {user,updateProfile}=useAuth();
  const [stats,setStats]=useState({total_earned:0,total_rentals:0,total_items:0,protection_fees:0,platform_fees:0});
  const [rentals,setRentals]=useState<any[]>([]);
  const [pixKey,setPixKey]=useState(user?.pix_key||"");

  useEffect(()=>{
    if(user)fetchData();
  },[user]);

  const fetchData=async()=>{
    if(!user)return;
    const {data:items}=await supabase.from("items").select("*").eq("user_id",user.id);
    const {data:ownerRentals}=await supabase.from("rentals").select("*").eq("owner_id",user.id).order("created_at",{ascending:false});
    const {data:renterRentals}=await supabase.from("rentals").select("*").eq("renter_id",user.id).order("created_at",{ascending:false});

    const completed=(ownerRentals||[]).filter(r=>r.status==="completed");
    const total=completed.reduce((sum,r)=>sum+Number(r.owner_payout||r.rental_price||0),0);
    const totalProtection=(ownerRentals||[]).reduce((sum,r)=>sum+Number(r.insurance_fee||0),0);
    const totalPlatform=(ownerRentals||[]).reduce((sum,r)=>sum+Number(r.platform_fee||0),0);

    setStats({total_earned:total,total_rentals:completed.length,total_items:items?.length||0,protection_fees:totalProtection,platform_fees:totalPlatform});
    setRentals([...(ownerRentals||[]),...(renterRentals||[])].slice(0,10));
  };

  const handleSavePix=async()=>{
    if(!pixKey)return;
    await updateProfile({pix_key:pixKey});
  };

  if(!user)return null;

  return(
    <div className="screen">
      <LaunchBanner/>
      <div className="header">
        <div className="header-glow"/>
        <div className="logo"><div className="logo-dot"/>Dashboard</div>
        <div className="logo-sub">{user.full_name} · {user.email}</div>
      </div>

      <div style={{padding:"16px 14px 8px"}}>
        <div className="eyebrow">Seus Ganhos</div>
        <div style={{display:"flex",gap:8}}>
          <div className="card em" style={{flex:2,textAlign:"center"}}>
            <div className="stat-value">{fmt(stats.total_earned)}</div>
            <div className="stat-label">Total Recebido</div>
          </div>
          <div className="card" style={{flex:1,textAlign:"center"}}>
            <div className="stat-value" style={{color:T.gold}}>{stats.total_rentals}</div>
            <div className="stat-label">Aluguéis</div>
          </div>
        </div>
      </div>

      <div style={{padding:"8px 14px"}}>
        <div className="eyebrow">Estatísticas</div>
        <div style={{display:"flex",gap:8}}>
          <div className="card" style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:T.text}}>{stats.total_items}</div>
            <div className="stat-label">Itens Ativos</div>
          </div>
          <div className="card go" style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:T.gold}}>{fmt(stats.protection_fees)}</div>
            <div className="stat-label">Taxa Proteção</div>
          </div>
          <div className="card" style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:T.muted}}>{fmt(stats.platform_fees)}</div>
            <div className="stat-label">Taxa Plataforma</div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 14px"}}>
        <div className="eyebrow">Chave Pix para Recebimentos</div>
        <div style={{display:"flex",gap:8}}>
          <input type="text" className="field" style={{flex:1,marginBottom:0}} placeholder="CPF, Email, Telefone ou Aleatória" value={pixKey} onChange={e=>setPixKey(e.target.value)}/>
          <button className="btn btn-em" style={{width:"auto",padding:"12px 16px"}} onClick={handleSavePix}>Salvar</button>
        </div>
      </div>

      <div className="sec-title">Histórico Recente</div>
      {rentals.length===0?(
        <div style={{padding:30,textAlign:"center",color:T.muted}}>
          <div style={{fontSize:13}}>Nenhum aluguel ainda</div>
        </div>
      ):rentals.map(r=>(
        <div key={r.id} className="card" style={{margin:"0 14px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.white}}>
                {r.owner_id===user.id?`Aluguel #${r.id}`:`Você alugou #${r.id}`}
              </div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>
                {new Date(r.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:r.owner_id===user.id?T.emerald:T.gold}}>
                {fmt(r.owner_id===user.id?r.owner_payout||r.rental_price:-r.total_amount)}
              </div>
              <span className={`badge ${r.status==="completed"?"g":r.status==="active"?"go":"ro"}`}>
                {r.status}
              </span>
            </div>
          </div>
          {r.delivery_lat&&(
            <div style={{fontSize:10,color:T.muted,marginTop:8,paddingTop:8,borderTop:`1px solid ${T.navyBdr}`}}>
              📍 Entrega registrada com GPS · 🛡️ Proteção ativa
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMS SCREENS
// ═══════════════════════════════════════════════════════════════════════════
function TermsScreen({type,onBack}:{type:"locador"|"locatario"|"privacidade";onBack:()=>void}){
  const terms={locador:`
<h2>Termos de Uso - Locador (Proprietário)</h2>

<p>Ao cadastrar e disponibilizar itens para aluguel na plataforma Vizinho Aluga, você concorda com os seguintes termos:</p>

<h3>1. Responsabilidades do Locador</h3>
<ul>
  <li>Garantir que o item anunciado é de sua propriedade e está em condições adequadas de uso</li>
  <li>Descrever fielmente as características, estado de conservação e valor do item</li>
  <li>Disponibilizar o item no período acordado com o locatário</li>
  <li>Informar antecipadamente caso não possa entregar o item na data combinada</li>
</ul>

<h3>2. Proteção Vizinho</h3>
<ul>
  <li>Todos os itens automaticamente protegidos com cobertura até R$500</li>
  <li>Taxa de 1% paga pelo locatário em cada transação</li>
  <li>Cobertura contra: danos acidentais, atraso na devolução, item não devolvido</li>
  <li>Processo de sinistro: abrir reclamação em até 7 dias após devolução</li>
</ul>

<h3>3. Comissionamento</h3>
<ul>
  <li>Plataforma retém 15% do valor do aluguel</li>
  <li>Proteção Vizinho: 1% (locatário)</li>
  <li>Locador recebe: 84% do valor total</li>
  <li>Pagamento via PIX em até 48h após devolução confirmada</li>
</ul>

<h3>4. Foto Obrigatória (GPS)</h3>
<ul>
  <li>Entrega e devolução devem ser documentadas com foto + geolocalização</li>
  <li>Fotos servem como prova em caso de disputa</li>
  <li>Coordenadas GPS validam que entrega ocorreu no local combinado</li>
</ul>

<h3>5. Disputas e Reclamações</h3>
<ul>
  <li>Em caso de danos, abrir reclamação em até 7 dias</li>
  <li>Proteção Vizinho analisa caso e aprova até R$500</li>
  <li>Para valores maiores, responsabilidade é do locatário</li>
  <li>Decisões da Proteção Vizinho são finais</li>
</ul>

<h3>6. Cancelamento</h3>
<ul>
  <li>Locador pode cancelar até 24h antes sem penalidade</li>
  <li>Cancelamentos após isso sujeitos à avaliação</li>
  <li>Reembolso automático ao locatário em casos válidos</li>
</ul>

<h3>7. Proibições</h3>
<ul>
  <li>É proibido alugar itens ilegais, roubados ou com restrição judicial</li>
  <li>É proibido cobrar valores fora da plataforma</li>
  <li>É proibido falsificar fotos ou informações</li>
  <li>Violações resultam em banimento permanente</li>
</ul>

<h3>8. LGPD - Seus Dados</h3>
<ul>
  <li>Seus dados são utilizados exclusivamente para operação da plataforma</li>
  <li>Não compartilhamos dados com terceiros sem consentimento</li>
  <li>Você pode solicitar exclusão a qualquer momento</li>
</ul>

<p style="color:#00B37E;font-weight:600;">Ao concordar, você declara estar ciente e de acordo com todos os termos acima.</p>
<p style="font-size:10px;color:#7A9BB5;margin-top:12px;">Última atualização: Janeiro 2025 · Vizinho Aluga · São José do Rio Preto/SP</p>
`,locatario:`
<h2>Termos de Uso - Locatário</h2>

<p>Ao alugar itens na plataforma Vizinho Aluga, você concorda com os seguintes termos:</p>

<h3>1. Responsabilidades do Locatário</h3>
<ul>
  <li>Utilizar o item exclusivamente para finalidade acordada</li>
  <li>Devolver o item no prazo e condições combinadas</li>
  <li>Comunicar imediatamente qualquer dano ou problema</li>
  <li>Fotografar item antes e depois do uso (GPS obrigatório)</li>
</ul>

<h3>2. Proteção Vizinho (Inclusa)</h3>
<ul>
  <li>Taxa de 1% incluída automaticamente em cada aluguel</li>
  <li>Cobertura de até R$500 para danos acidentais</li>
  <li>NÃO cobre: mau uso intencional, roubo, perda</li>
  <li>Responsabilidade total do locatário acima de R$500</li>
</ul>

<h3>3. Foto + GPS na Entrega</h3>
<ul>
  <li>Registro fotográfico obrigatório com geolocalização</li>
  <li>Serve como prova do estado do item</li>
  <li>Coordenadas confirmam local de entrega</li>
  <li>Fotos são anexadas automaticamente ao contrato</li>
</ul>

<h3>4. Pagamento</h3>
<ul>
  <li>Pagamento total upfront (aluguel + proteção + taxa)</li>
  <li>Cancelamento até 24h antes: reembolso integral</li>
  <li>Cancelamento após: sujeito à aprovação do locador</li>
  <li>Reembolso em até 5 dias úteis</li>
</ul>

<h3>5. Atraso na Devolução</h3>
<ul>
  <li>Atraso de até 24h: multa de 1 diária</li>
  <li>Atraso superior: cobrança proporcional + taxa extra</li>
  <li>Item não devolvido após 72h: acionamento da Proteção Vizinho</li>
</ul>

<h3>6. Danos ao Item</h3>
<ul>
  <li>Danos até R$500: cobertos pela Proteção Vizinho</li>
  <li>Danos acima de R$500: locatário paga diferença</li>
  <li>Danos intencionais: responsabilidade 100% do locatário</li>
  <li>Item perdido/roubado: valor integral + boletim de ocorrência</li>
</ul>

<h3>7. Disputas</h3>
<ul>
  <li>Em caso de discordância, abrir disputa em até 7 dias</li>
  <li>Plataforma analisa evidências (fotos, GPS, mensagens)</li>
  <li>Decisão final em até 14 dias</li>
  <li>Proteção Vizinho pode ser acionada para indenização</li>
</ul>

<h3>8. LGPD - Seus Dados</h3>
<ul>
  <li>Localização GPS usada apenas como evidência de entrega</li>
  <li>Fotos armazenadas por 1 ano para fins de disputa</li>
  <li>Dados não compartilhados sem consentimento</li>
  <li>Solicitação de exclusão: suporte@vizinhoaluga.com</li>
</ul>

<p style="color:#00B37E;font-weight:600;">Ao alugar, você declara estar ciente e de acordo com todos os termos acima.</p>
<p style="font-size:10px;color:#7A9BB5;margin-top:12px;">Última atualização: Janeiro 2025 · Vizinho Aluga · São José do Rio Preto/SP</p>
`,privacidade:`
<h2>Política de Privacidade - LGPD</h2>

<p>A Vizinho Aluga está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>

<h3>1. Dados Coletados</h3>
<ul>
  <li><strong>Dados de Cadastro:</strong> nome, e-mail, telefone, CEP, localização</li>
  <li><strong>Dados de Transação:</strong> histórico de aluguéis, valores, datas, itens</li>
  <li><strong>Dados de Geolocalização:</strong> coordenadas GPS no momento de entrega/devolução</li>
  <li><strong>Dados de Imagem:</strong> fotos de itens e evidências de entrega</li>
  <li><strong>Dados Financeiros:</strong> chave PIX, valores recebidos/pagos</li>
</ul>

<h3>2. Finalidade do Tratamento</h3>
<ul>
  <li>Permitir cadastro e uso da plataforma</li>
  <li>Conectar locadores e locatários</li>
  <li>Processar pagamentos e repasses</li>
  <li>Garantir segurança das transações (foto + GPS)</li>
  <li>Acionar Proteção Vizinho quando necessário</li>
  <li>Resolver disputas entre usuários</li>
  <li>Enviar notificações sobre transações</li>
  <li>Cumprir obrigações legais</li>
</ul>

<h3>3. Base Legal (Art. 7º LGPD)</h3>
<ul>
  <li><strong>Consentimento:</strong> cadastro, uso da plataforma</li>
  <li><strong>Execução de Contrato:</strong> aluguéis, pagamentos, proteção</li>
  <li><strong>Legítimo Interesse:</strong> segurança, prevenção de fraudes</li>
  <li><strong>Obrigação Legal:</strong> retenção de dados fiscais, disputas</li>
</ul>

<h3>4. Compartilhamento de Dados</h3>
<ul>
  <li><strong>Entre Usuários:</strong> nome, localização, avaliação (para transação)</li>
  <li><strong>Proteção Vizinho:</strong> dados de sinistro (se aplicável)</li>
  <li><strong>Gateway de Pagamento:</strong> dados mínimos para processar PIX</li>
  <li><strong>Autoridades:</strong> se exigido por lei ou ordem judicial</li>
  <li><strong>NUNCA:</strong> vendemos seus dados a terceiros</li>
</ul>

<h3>5. Retenção de Dados</h3>
<ul>
  <li>Dados de cadastro: enquanto conta ativa</li>
  <li>Dados de transação: 5 anos (obrigação fiscal)</li>
  <li>Fotos de evidência: 1 ano após última transação</li>
  <li>Geolocalização: 1 ano (prova em disputas)</li>
  <li>Dados anonimizados: podem ser mantidos para estatísticas</li>
</ul>

<h3>6. Seus Direitos (Art. 18 LGPD)</h3>
<ul>
  <li><strong>Confirmação:</strong> confirmar se dados são tratados</li>
  <li><strong>Acesso:</strong> acessar todos os seus dados</li>
  <li><strong>Correção:</strong> corrigir dados incompletos ou incorretos</li>
  <li><strong>Anonimização/Bloqueio:</strong> para dados desnecessários</li>
  <li><strong>Eliminação:</strong> excluir dados (exceto obrigações legais)</li>
  <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
  <li><strong>Eliminação do Consentimento:</strong> retirar consentimento a qualquer momento</li>
  <li><strong>Oposição:</strong> contestar tratamento em legítimo interesse</li>
</ul>

<h3>7. Como Exercer Seus Direitos</h3>
<ul>
  <li>E-mail: privacidade@vizinhoaluga.com</li>
  <li>Resposta em até 15 dias (Art. 19 LGPD)</li>
  <li>Gratuito</li>
  <li>Pode ser solicitado a qualquer momento</li>
</ul>

<h3>8. Segurança dos Dados</h3>
<ul>
  <li>Armazenamento em servidores seguros (Supabase)</li>
  <li>Criptografia em trânsito (HTTPS) e em repouso</li>
  <li>Controle de acesso restrito</li>
  <li>Backups diários</li>
  <li>Row Level Security (RLS) no banco de dados</li>
</ul>

<h3>9. Cookies</h3>
<ul>
  <li>Utilizamos apenas cookies essenciais para funcionamento</li>
  <li>Sem rastreamento para publicidade</li>
  <li>Session cookies para autenticação</li>
</ul>

<h3>10. Menores de Idade</h3>
<ul>
  <li>Plataforma destina-se apenas a maiores de 18 anos</li>
  <li>Menores podem usar sob responsabilidade dos pais</li>
  <li>Pais/guardiões são responsáveis por transações</li>
</ul>

<h3>11. Transferência Internacional</h3>
<ul>
  <li>Supabase possui servidores nos EUA</li>
  <li>Transferência autorizada por cláusulas contratuais padrão</li>
  <li>Dados protegidos conforme nível de proteção do Brasil</li>
</ul>

<h3>12. Encarregado de Dados (DPO)</h3>
<ul>
  <li>Nome: Equipe Vizinho Aluga</li>
  <li>E-mail: dpo@vizinhoaluga.com</li>
  <li>Contato para dúvidas, reclamações e solicitações</li>
</ul>

<h3>13. Alterações nesta Política</h3>
<ul>
  <li>Alterações comunicadas por e-mail</li>
  <li>Publicadas nesta página</li>
  <li>Uso continuado após alteração = aceitação</li>
</ul>

<h3>14. Reclamações</h3>
<ul>
  <li>Se sentir que seus direitos foram violados:</li>
  <li>1. Contate-nos: privacidade@vizinhoaluga.com</li>
  <li>2. ANPD (Autoridade Nacional de Proteção de Dados): www.gov.br/anpd</li>
</ul>

<p style="color:#00B37E;font-weight:600;">Sua privacidade é nossa prioridade. Use a plataforma com segurança.</p>
<p style="font-size:10px;color:#7A9BB5;margin-top:12px;">Última atualização: Janeiro 2025 · Vizinho Aluga · CNPJ: [inserir] · São José do Rio Preto/SP</p>
`};

  return(
    <div className="screen">
      <div className="header">
        <button style={{background:"none",border:"none",color:T.emerald,cursor:"pointer",fontSize:24,padding:0,marginRight:8}} onClick={onBack}>←</button>
        <div className="logo" style={{fontSize:18}}>Termos - {type==="locador"?"Locador":type==="locatario"?"Locatário":"Privacidade"}</div>
      </div>
      <div style={{padding:"20px 14px 100px",lineHeight:1.7,fontSize:13,color:T.text}} dangerouslySetInnerHTML={{__html:terms[type]}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTNERS SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function PartnersScreen({onBack,onAdmin}:{onBack:()=>void;onAdmin:()=>void}){
  const [partners,setPartners]=useState<ServicesPartner[]>([]);
  const [filtered,setFiltered]=useState<ServicesPartner[]>([]);
  const [category,setCategory]=useState<string>("all");
  const [city,setCity]=useState<string>("São José do Rio Preto");

  useEffect(()=>{fetchPartners();},[]);

  useEffect(()=>{
    let f=partners;
    if(city!=="all")f=f.filter(p=>p.cities.includes(city));
    if(category!=="all")f=f.filter(p=>p.category===category);
    setFiltered(f);
  },[partners,category,city]);

  const fetchPartners=async()=>{
    const{data}=await supabase.from("services_partners").select("*").eq("is_active",true).order("is_verified",{ascending:false}).order("clicks",{ascending:false});
    if(data)setPartners(data as ServicesPartner[]);
  };

  const handleClick=async(p:ServicesPartner)=>{
    await supabase.rpc("increment_partner_clicks",{partner_id:p.id});
    const condominio=p.condominiums.find(c=>c.includes("Geral"))||p.condominiums[0]||city;
    const msg=`Olá, vi seu contato no Vizinho Aluga - ${condominio}. Preciso de um ${p.category.toLowerCase()}.`;
    const url=`https://wa.me/${p.whatsapp}?text=${encodeURIComponent(msg)}&utm_source=vizinhoaluga&utm_medium=parceiros&utm_campaign=${encodeURIComponent(condominio)}`;
    window.open(url,"_blank");
    fetchPartners();
  };

  const DISCLAIMER="Vizinho Aluga apenas divulga o contato. A contratação e execução do serviço são de responsabilidade direta entre morador e prestador.";

  return(
    <div className="screen">
      <div className="header">
        <button style={{background:"none",border:"none",color:T.emerald,cursor:"pointer",fontSize:24,padding:0,marginRight:8}} onClick={onBack}>←</button>
        <div className="logo" style={{fontSize:18}}>Parceiros do Condomínio</div>
      </div>

      <div style={{background:`${T.orangeLo}`,borderBottom:`1px solid rgba(249,115,22,0.3)`,padding:"10px 14px",fontSize:11,color:T.orange,textAlign:"center"}}>
        ⚠️ {DISCLAIMER}
      </div>

      <div style={{padding:"16px 14px"}}>
        <div style={{fontSize:13,color:T.muted,marginBottom:12}}>Serviços de confiança indicados aqui no bairro. Contato direto via WhatsApp.</div>

        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <select className="field" style={{flex:1,cursor:"pointer",marginBottom:0}} value={city} onChange={e=>setCity(e.target.value)}>
            <option value="all"> Todas as cidades</option>
            <option value="São José do Rio Preto">São José do Rio Preto</option>
            <option value="Olímpia">Olímpia</option>
          </select>
          <select className="field" style={{flex:1,cursor:"pointer",marginBottom:0}} value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="all">Todas categorias</option>
            <option value="Encanador">Encanador</option>
            <option value="Eletricista">Eletricista</option>
            <option value="Diarista">Diarista</option>
            <option value="Chaveiro">Chaveiro</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        {filtered.length===0?(
          <div style={{textAlign:"center",padding:40,color:T.muted}}>Nenhum parceiro encontrado</div>
        ):filtered.map(p=>(
          <div key={p.id} style={{background:T.navyMid,border:`1px solid ${T.navyBdr}`,borderRadius:16,padding:14,marginBottom:10,position:"relative"}}>
            <div style={{position:"absolute",top:10,right:10,background:T.orangeLo,color:T.orange,border:`1px solid rgba(249,115,22,0.25)`,padding:"2px 8px",borderRadius:12,fontSize:9,fontWeight:700}}>Patrocinado</div>
            <div style={{display:"flex",gap:12}}>
              <div style={{width:56,height:56,borderRadius:12,background:T.navyLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
                {p.photo_url?(<img src={p.photo_url} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/>):(p.category==="Encanador"?"🔧":p.category==="Eletricista"?"⚡":p.category==="Diarista"?"🧹":p.category==="Chaveiro"?"🔑":"🛠️")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16,color:T.white}}>{p.name}</div>
                <div style={{fontSize:11,color:T.orange,marginTop:2}}>{p.category}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:6,lineHeight:1.4}}>{p.description}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:6}}>📍 {p.condominiums.slice(0,2).join(", ")}{p.condominiums.length>2?", ...":""}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}>
              <button className="btn btn-em" style={{flex:1,padding:12,fontSize:13}} onClick={()=>handleClick(p)}>
                📱 Chamar no WhatsApp
              </button>
              <div style={{fontSize:10,color:T.muted,textAlign:"center"}}>{p.clicks} cliques</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:T.navyLight,borderTop:`1px solid ${T.navyBdr}`,padding:"12px 14px",textAlign:"center",position:"fixed",bottom:0,left:0,right:0,maxWidth:430,margin:"0 auto"}}>
        <div style={{fontSize:10,color:T.muted,lineHeight:1.5}}>⚠️ {DISCLAIMER}</div>
        <button style={{background:"none",border:"none",color:T.orange,cursor:"pointer",fontSize:11,marginTop:6}} onClick={onAdmin}>Admin Parceiros (beta)</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN PARTNERS SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function AdminPartnersScreen({onBack}:{onBack:()=>void}){
  const [partners,setPartners]=useState<ServicesPartner[]>([]);
  const [editing,setEditing]=useState<ServicesPartner|null>(null);
  const [showForm,setShowForm]=useState(false);

  const emptyPartner:Omit<ServicesPartner,"id"|"clicks"|"created_at"|"updated_at">={
    name:"",category:"Encanador",whatsapp:"",description:"",photo_url:"",
    condominiums:[],cities:["São José do Rio Preto","Olímpia"],
    is_active:true,is_verified:true,plan:"condominio",monthly_price:97
  };
  const [form,setForm]=useState(emptyPartner);
  const [condoInput,setCondoInput]=useState("");

  useEffect(()=>{fetchPartners();},[]);

  const fetchPartners=async()=>{
    const{data}=await supabase.from("services_partners").select("*").order("created_at",{ascending:false});
    if(data)setPartners(data as ServicesPartner[]);
  };

  const handleSave=async()=>{
    if(!form.name||!form.whatsapp)return;
    if(editing){
      await supabase.from("services_partners").update(form).eq("id",editing.id);
    }else{
      await supabase.from("services_partners").insert(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyPartner);
    fetchPartners();
  };

  const handleEdit=(p:ServicesPartner)=>{
    setEditing(p);
    setForm(p);
    setShowForm(true);
  };

  const handleDelete=async(id:string)=>{
    if(confirm("Excluir este parceiro?")){await supabase.from("services_partners").delete().eq("id",id);fetchPartners();}
  };

  const toggleActive=async(p:ServicesPartner)=>{
    await supabase.from("services_partners").update({is_active:!p.is_active}).eq("id",p.id);
    fetchPartners();
  };

  const addCondo=()=>{
    if(condoInput.trim()&&!form.condominiums.includes(condoInput.trim())){
      setForm(f=>({...f,condominiums:[...f.condominiums,condoInput.trim()]}));
      setCondoInput("");
    }
  };

  const categories=["Encanador","Eletricista","Diarista","Chaveiro","Outros"];

  return(
    <div className="screen">
      <div className="header">
        <button style={{background:"none",border:"none",color:T.emerald,cursor:"pointer",fontSize:24,padding:0,marginRight:8}} onClick={onBack}>←</button>
        <div className="logo" style={{fontSize:18}}>Admin Parceiros</div>
      </div>

      <div style={{padding:"16px 14px 100px"}}>
        <button className="btn btn-em" style={{marginBottom:16}} onClick={()=>{setEditing(null);setForm(emptyPartner);setShowForm(true);}}>+ Novo Parceiro</button>

        {showForm&&(
          <div className="card" style={{margin:"0 0 16px"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16,marginBottom:12}}>{editing?"Editar":"Novo"} Parceiro</div>
            <input className="field" placeholder="Nome" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            <select className="field" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value as any}))}>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <input className="field" placeholder="WhatsApp (5517999999999)" value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))}/>
            <input className="field" placeholder="Descrição (máx 120 chars)" maxLength={120} value={form.description||""} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
            <input className="field" placeholder="URL da foto" value={form.photo_url||""} onChange={e=>setForm(f=>({...f,photo_url:e.target.value}))}/>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input className="field" style={{flex:1,marginBottom:0}} placeholder="Condomínio" value={condoInput} onChange={e=>setCondoInput(e.target.value)}/>
              <button className="btn btn-out" style={{width:"auto",padding:"8px 12px",fontSize:12}} onClick={addCondo}>+</button>
            </div>
            <div style={{fontSize:10,color:T.muted,marginBottom:8}}>{form.condominiums.join(", ")}</div>
            <select className="field" value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value as any}))}>
              <option value="condominio">Plano Condomínio (R$97/mês)</option>
              <option value="rede">Plano Rede (R$147/mês)</option>
            </select>
            <div style={{display:"flex",gap:8,marginBottom:12,fontSize:12}}>
              <label style={{color:T.muted}}><input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/> Ativo</label>
              <label style={{color:T.muted}}><input type="checkbox" checked={form.is_verified} onChange={e=>setForm(f=>({...f,is_verified:e.target.checked}))}/> Verificado</label>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-em" style={{flex:1}} onClick={handleSave}>Salvar</button>
              <button className="btn btn-out" style={{flex:1}} onClick={()=>{setShowForm(false);setEditing(null);}}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{fontSize:12,color:T.muted,marginBottom:8}}>{partners.length} parceiros</div>

        {partners.map(p=>(
          <div key={p.id} className="card" style={{margin:"0 0 10px",padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:T.white}}>{p.name}</div>
                <div style={{fontSize:11,color:T.orange,marginTop:2}}>{p.category}</div>
                <div style={{display:"flex",gap:4,marginTop:6}}>
                  <span className="badge" style={p.is_active?{background:T.emeraldLo,color:T.emerald}:{background:T.roseLo,color:T.rose}}>{p.is_active?"Ativo":"Inativo"}</span>
                  {p.is_verified&&<span className="badge g">Verificado</span>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:700,color:T.emerald}}>{p.clicks}</div>
                <div style={{fontSize:9,color:T.muted}}>cliques</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button className="btn btn-out" style={{flex:1,padding:10,fontSize:12}} onClick={()=>toggleActive(p)}>{p.is_active?"Desativar":"Ativar"}</button>
              <button className="btn btn-out" style={{flex:1,padding:10,fontSize:12}} onClick={()=>handleEdit(p)}>Editar</button>
              <button className="btn btn-out" style={{flex:1,padding:10,fontSize:12,borderColor:T.red,color:T.red}} onClick={()=>handleDelete(p.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
function AppContent(){
  const {session,loading,signOut}=useAuth();
  const [tab,setTab]=useState("home");
  const [toast,setToast]=useState("");
  const [selectedItem,setSelectedItem]=useState<Item|null>(null);
  const [showTerms,setShowTerms]=useState<"locador"|"locatario"|"privacidade"|null>(null);
  const [showPartners,setShowPartners]=useState(false);
  const [showAdminPartners,setShowAdminPartners]=useState(false);

  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.navy}}><div style={{fontFamily:"'Outfit',sans-serif",color:T.text}}>Carregando...</div></div>);

  if(showTerms)return<TermsScreen type={showTerms} onBack={()=>setShowTerms(null)}/>;
  if(showAdminPartners)return<AdminPartnersScreen onBack={()=>setShowAdminPartners(false)}/>;
  if(showPartners)return<PartnersScreen onBack={()=>setShowPartners(false)} onAdmin={()=>{setShowPartners(false);setShowAdminPartners(true);}}/>;

  if(!session)return <AuthScreen/>;

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        {toast&&<div className="toast">{toast}</div>}
        {selectedItem&&<RentalCheckout item={selectedItem} onClose={()=>setSelectedItem(null)} onSuccess={()=>{setSelectedItem(null);setToast("✓ Aluguel solicitado!");setTimeout(()=>setToast(""),2800);setTab("dashboard");}}/>}

        {tab==="home"&&<HomeScreen onNavigate={setTab}/>}
        {tab==="announce"&&<AnnounceScreen onSuccess={()=>{setTab("browse");setToast("✓ Item publicado!");setTimeout(()=>setToast(""),2800);}}/>}
        {tab==="browse"&&<BrowseScreen onRent={setSelectedItem}/>}
        {tab==="dashboard"&&<DashboardScreen/>}
        {tab==="partners"&&<PartnersScreen onBack={()=>setTab("home")} onAdmin={()=>setShowAdminPartners(true)}/>}
        {tab==="more"&&(
          <div className="screen">
            <LaunchBanner/>
            <div className="header"><div className="logo"><div className="logo-dot"/>Mais</div></div>
            <div style={{padding:20}}>
              <button className="btn btn-out" style={{marginBottom:10,borderColor:T.orange,color:T.orange}} onClick={()=>setShowPartners(true)}>Serviços Parceiros</button>
              <button className="btn btn-out" style={{marginBottom:10}} onClick={()=>setShowTerms("locador")}>Térmos do Locador</button>
              <button className="btn btn-out" style={{marginBottom:10}} onClick={()=>setShowTerms("locatario")}>Térmos do Locatário</button>
              <button className="btn btn-out" style={{marginBottom:10}} onClick={()=>setShowTerms("privacidade")}>Política de Privacidade (LGPD)</button>
              <button className="btn btn-out" style={{marginBottom:20,borderColor:T.red,color:T.red}} onClick={async()=>{await signOut();}}>Sair</button>
            </div>
          </div>
        )}

        <nav className="nav">
          {[{id:"home",label:"Início"},{id:"announce",label:"Anunciar"},{id:"browse",label:"Catálogo"},{id:"partners",label:"Serviços"},{id:"dashboard",label:"Ganhos"}].map(n=>(
            <button key={n.id} className={`nav-btn${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)} style={{fontSize:11}}>{n.label}</button>
          ))}
        </nav>
      </div>
    </>
  );
}

export default function App(){return(<AuthProvider><AppContent/></AuthProvider>);}
