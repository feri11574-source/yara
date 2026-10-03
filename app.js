const cfg=window.YARA_CONFIG||{};
const hasConfig=cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR_");
const sb=hasConfig?supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
let products=[],cart=JSON.parse(localStorage.getItem("yara-cart")||"[]"),currentUser=null;
const $=s=>document.querySelector(s), fa=n=>new Intl.NumberFormat("fa-IR").format(n)+" تومان";
const demo=[
{id:"d1",name:"کت لینن مینیمال",category:"زنانه",price:1890000,old_price:2390000,image_color:"#9c806d",sale:true},
{id:"d2",name:"پیراهن آکسفورد کلاسیک",category:"مردانه",price:1290000,old_price:null,image_color:"#56616b",sale:false},
{id:"d3",name:"ست سویشرت کودک",category:"بچگانه",price:890000,old_price:1100000,image_color:"#c28f78",sale:true},
{id:"d4",name:"شومیز ساتن یارا",category:"زنانه",price:990000,old_price:null,image_color:"#b7a49b",sale:false},
{id:"d5",name:"شلوار کتان راسته",category:"مردانه",price:1090000,old_price:1390000,image_color:"#77736c",sale:true},
{id:"d6",name:"هودی روزمره کودک",category:"بچگانه",price:760000,old_price:null,image_color:"#71808a",sale:false},
{id:"d7",name:"مانتوی روزمره",category:"زنانه",price:1590000,old_price:null,image_color:"#75675e",sale:false},
{id:"d8",name:"کت تک شهری",category:"مردانه",price:2290000,old_price:2690000,image_color:"#30343a",sale:true}
];
async function loadProducts(){
 if(sb){const {data,error}=await sb.from("products").select("*").eq("is_active",true).order("created_at",{ascending:false}); if(!error&&data?.length) products=data; else products=demo}
 else products=demo;
 renderProducts();
}
function renderProducts(cat="all",q=""){
 const list=products.filter(p=>(cat==="all"||p.category===cat||(cat==="sale"&&p.sale))&&(!q||p.name.includes(q)||p.category.includes(q)));
 $("#productsGrid").innerHTML=list.map(p=>`<article class="card"><div class="photo" style="--tone:${p.image_color||"#8b7462"}"><span class="badge">${p.sale?"تخفیف":p.category}</span></div><span class="cat">${p.category}</span><h3>${p.name}</h3><div class="price"><strong>${fa(p.price)}</strong>${p.old_price?`<span class="old">${fa(p.old_price)}</span>`:""}</div><button onclick="addCart('${p.id}')">افزودن به سبد</button><button onclick="detail('${p.id}')">جزئیات</button></article>`).join("")||"<p>محصولی پیدا نشد.</p>";
}
function addCart(id){let p=products.find(x=>String(x.id)===String(id));if(!p)return;let x=cart.find(a=>String(a.id)===String(id));x?x.qty++:cart.push({id,qty:1});saveCart();toast("محصول به سبد اضافه شد.");}
function saveCart(){localStorage.setItem("yara-cart",JSON.stringify(cart));renderCart();$("#count").textContent=cart.reduce((a,x)=>a+x.qty,0).toLocaleString("fa-IR")}
function renderCart(){let box=$("#cartItems"),total=0;if(!cart.length){box.innerHTML="<p style='padding:40px;text-align:center;color:#888'>سبد خرید خالی است.</p>";$("#total").textContent="۰ تومان";return}box.innerHTML=cart.map(x=>{let p=products.find(a=>String(a.id)===String(x.id));if(!p)return"";total+=p.price*x.qty;return `<div class="cart-row"><div class="thumb" style="background:linear-gradient(145deg,#eee,${p.image_color||"#aaa"})"></div><div><h4>${p.name}</h4><p>${x.qty.toLocaleString("fa-IR")} × ${fa(p.price)}</p><button onclick="removeCart('${p.id}')">حذف</button></div><strong>${fa(p.price*x.qty)}</strong></div>`}).join("");$("#total").textContent=fa(total)}
function removeCart(id){cart=cart.filter(x=>String(x.id)!==String(id));saveCart()}
function openDrawer(){ $("#drawer").classList.add("open");$("#overlay").classList.add("show") } function closeAll(){$("#drawer").classList.remove("open");$("#overlay").classList.remove("show");document.querySelectorAll(".modal").forEach(x=>x.classList.remove("show"))}
function detail(id){let p=products.find(x=>String(x.id)===String(id));$("#productContent").innerHTML=`<div class="product-detail"><div class="detail-photo" style="background:linear-gradient(145deg,#eee5dc,${p.image_color||"#aaa"})"></div><div><span class="eyebrow">${p.category}</span><h2>${p.name}</h2><p>${p.description||"محصول باکیفیت از مجموعه یارا. مشخصات، رنگ و سایزبندی این کالا از پنل مدیریت قابل تغییر است."}</p><div class="price"><strong>${fa(p.price)}</strong>${p.old_price?`<span class="old">${fa(p.old_price)}</span>`:""}</div><button class="btn" onclick="addCart('${p.id}');closeAll()">افزودن به سبد خرید</button></div></div>`;$("#productModal").classList.add("show");$("#overlay").classList.add("show")}
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
async function authUI(){
 if(!sb){$("#authContent").innerHTML="<h2>اتصال حساب کاربری</h2><p>ابتدا اطلاعات Supabase را در config.js وارد کنید.</p>";$("#authModal").classList.add("show");$("#overlay").classList.add("show");return}
 if(currentUser){$("#authContent").innerHTML=`<h2>حساب کاربری</h2><p>${currentUser.email}</p><button class="btn" onclick="logout()">خروج</button>`}
 else $("#authContent").innerHTML=`<h2>ورود / ثبت‌نام</h2><input id="email" type="email" placeholder="ایمیل" style="width:100%;padding:13px;margin:10px 0;border:1px solid #ddd;border-radius:10px"><input id="password" type="password" placeholder="رمز عبور" style="width:100%;padding:13px;margin:10px 0;border:1px solid #ddd;border-radius:10px"><button class="btn" onclick="login()">ورود یا ثبت‌نام</button>`;
 $("#authModal").classList.add("show");$("#overlay").classList.add("show")
}
async function login(){let email=$("#email").value,password=$("#password").value;if(!email||!password)return toast("ایمیل و رمز را وارد کنید.");let r=await sb.auth.signInWithPassword({email,password});if(r.error){r=await sb.auth.signUp({email,password})}if(r.error)toast(r.error.message);else{currentUser=r.data.user;toast("ورود با موفقیت انجام شد.");closeAll();$("#loginBtn").textContent="حساب من"}}
async function logout(){await sb.auth.signOut();currentUser=null;closeAll();$("#loginBtn").textContent="ورود"}
async function checkout(){if(!cart.length)return toast("سبد خرید خالی است.");if(!sb||!currentUser)return authUI();let total=cart.reduce((s,x)=>{let p=products.find(a=>String(a.id)===String(x.id));return s+(p?p.price*x.qty:0)},0);let r=await sb.from("orders").insert({user_id:currentUser.id,total_amount:total,status:"pending",items:cart});if(r.error)toast(r.error.message);else{cart=[];saveCart();toast("سفارش ثبت شد. برای اتصال درگاه پرداخت باید کلید درگاه را اضافه کنیم.");closeAll()}}
$("#cartBtn").onclick=openDrawer;$("#closeCart").onclick=closeAll;$("#overlay").onclick=closeAll;$("#loginBtn").onclick=authUI;$("#checkout").onclick=checkout;document.querySelectorAll("[data-close]").forEach(x=>x.onclick=closeAll);
$("#searchBtn").onclick=()=>{$("#searchBox").classList.toggle("show");$("#search").focus()};$("#search").oninput=e=>renderProducts(document.querySelector(".filters .active").dataset.cat,e.target.value.trim());
document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts(b.dataset.cat,$("#search").value.trim())});
$("#newsletter").onsubmit=e=>{e.preventDefault();toast("ایمیل شما ثبت شد.")};
if(sb)sb.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;if(currentUser)$("#loginBtn").textContent="حساب من"});
loadProducts();saveCart();
