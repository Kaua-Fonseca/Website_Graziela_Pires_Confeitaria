import { useEffect, useMemo, useState, type ReactNode } from "react";

type View = "home" | "catalogo" | "produto" | "showroom" | "orcamento";
type IconName =
  | "arrow"
  | "chevron"
  | "close"
  | "instagram"
  | "menu"
  | "minus"
  | "plus"
  | "upload"
  | "whatsapp";

const photos = {
  hero: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1800&q=90",
  floral: "https://images.unsplash.com/photo-1683435844308-b757f5ca64b1?auto=format&fit=crop&w=1200&q=85",
  white: "https://images.unsplash.com/photo-1706188458145-f11cb33aa1a0?auto=format&fit=crop&w=1200&q=85",
  pink: "https://images.unsplash.com/photo-1604702389032-28cff7432c48?auto=format&fit=crop&w=1200&q=85",
  chocolate: "https://images.unsplash.com/photo-1605807646983-377bc5a76493?auto=format&fit=crop&w=1200&q=85",
  dark: "https://images.unsplash.com/photo-1541780054671-b9a8504291ec?auto=format&fit=crop&w=1200&q=85",
  birthday: "https://images.unsplash.com/photo-1610670444950-0b29430891b4?auto=format&fit=crop&w=1200&q=85",
  cupcake: "https://images.unsplash.com/photo-1590741664176-7fbd7e2592a0?auto=format&fit=crop&w=1200&q=85",
  cupcakes: "https://images.unsplash.com/photo-1630953900039-960a64b49176?auto=format&fit=crop&w=1200&q=85",
  brigadeiro: "https://images.unsplash.com/photo-1689511327380-065440a857b1?auto=format&fit=crop&w=1200&q=85",
  truffle: "https://images.unsplash.com/photo-1639158924965-7be3bb57506b?auto=format&fit=crop&w=1200&q=85",
  baker: "https://images.unsplash.com/photo-1655762755958-cc0e10095c24?auto=format&fit=crop&w=1400&q=85",
};

const products = [
  { name: "Naked Clássico", category: "Naked Cake", image: photos.chocolate, price: "A partir de R$ 165", detail: "Massa de chocolate, brigadeiro cremoso e finalização artesanal." },
  { name: "Jardim Botânico", category: "Bolos Personalizados", image: photos.floral, price: "A partir de R$ 320", detail: "Flores naturais e acabamento de textura suave." },
  { name: "Branco & Oliva", category: "Bolos Personalizados", image: photos.white, price: "Sob consulta", detail: "Minimalista, elegante e criado para celebrações especiais." },
  { name: "Caixa Celebração", category: "Doces", image: photos.brigadeiro, price: "A partir de R$ 78", detail: "24 doces artesanais em sabores clássicos." },
  { name: "Cupcake Cacau", category: "Cupcakes", image: photos.cupcake, price: "A partir de R$ 9/un.", detail: "Chocolate intenso, recheio cremoso e buttercream." },
  { name: "Romance Floral", category: "Bolos Personalizados", image: photos.pink, price: "A partir de R$ 290", detail: "Pintura delicada, flores e composição personalizada." },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    menu: <><path d="M4 8h16" /><path d="M4 16h16" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    whatsapp: <><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" /><path d="M9 8.5c.5 2 2 3.5 4 4l1-1c.5-.3 1.8.6 2 .9.2.5-.4 2-2 2.1-3.5.1-6.5-3-6.5-6.2 0-1.3 1.3-2 1.6-1.8l.9 2Z" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({ children, variant = "primary", onClick, disabled, type = "button", className = "" }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "light"; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; className?: string }) {
  return <button className={`button button-${variant} ${className}`} onClick={onClick} disabled={disabled} type={type}>{children}</button>;
}

function Link({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return <a href="#" className={className} onClick={(event) => { event.preventDefault(); onClick?.(); }}>{children}</a>;
}

function Title({ children, level = 2, className = "" }: { children: ReactNode; level?: 1 | 2 | 3; className?: string }) {
  return <div role="heading" aria-level={level} className={`title title-${level} ${className}`}>{children}</div>;
}

function SectionHeader({ eyebrow, title, text, align = "left" }: { eyebrow: string; title: ReactNode; text?: string; align?: "left" | "center" }) {
  return <div className={`section-header ${align === "center" ? "center" : ""}`}><span className="eyebrow">{eyebrow}</span><Title>{title}</Title>{text && <p>{text}</p>}</div>;
}

function Logo({ light = false }: { light?: boolean }) {
  return <div className={`logo ${light ? "logo-light" : ""}`}><span>Graziela Pires</span><small>CONFEITARIA</small></div>;
}

function Navbar({ go }: { go: (view: View, anchor?: string) => void }) {
  const [open, setOpen] = useState(false);
  const items: [string, View, string?][] = [["Início", "home"], ["Catálogo", "catalogo"], ["Showroom", "showroom"], ["Como funciona", "home", "processo"]];
  return <header className="navbar">
    <div className="nav-inner">
      <Link onClick={() => go("home")} className="brand-link"><Logo /></Link>
      <nav className={`nav-links ${open ? "open" : ""}`}>
        {items.map(([label, view, anchor]) => <Link key={label} onClick={() => { go(view, anchor); setOpen(false); }}>{label}</Link>)}
        <Button onClick={() => { go("orcamento"); setOpen(false); }}>Solicitar orçamento <Icon name="arrow" size={17} /></Button>
      </nav>
      <Button variant="ghost" className="menu-button" onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} /></Button>
    </div>
  </header>;
}

function Hero({ go }: { go: (view: View, anchor?: string) => void }) {
  return <section className="hero">
    <div className="hero-copy">
      <span className="eyebrow reveal">CONFEITARIA ARTESANAL · FOZ DO IGUAÇU</span>
      <Title level={1}>Seu momento,<br /><em>em forma de doce.</em></Title>
      <p>Bolos e doces personalizados, feitos à mão para a sua celebração.</p>
      <div className="button-row"><Button onClick={() => go("orcamento")}>Pedir orçamento <Icon name="arrow" size={18} /></Button><Button variant="secondary" onClick={() => go("catalogo")}>Ver catálogo</Button></div>
      <div className="hero-note"><span>Desde 2019</span><i /><span>Foz do Iguaçu</span><i /><span>Sob encomenda</span></div>
    </div>
    <div className="hero-image-wrap">
      <img src={photos.hero} alt="Bolo artesanal floral em uma celebração elegante" />
      <div className="hero-stamp"><small>Criado especialmente</small><strong>para você</strong></div>
    </div>
    <div className="scroll-cue"><span>DESCUBRA</span><i /></div>
  </section>;
}

const categories = [
  ["Naked Cake", "Delicadeza e sabor em camadas.", photos.chocolate],
  ["Bolos personalizados", "Um bolo criado para combinar com o seu momento.", photos.floral],
  ["Doces", "Clássicos artesanais para compartilhar.", photos.brigadeiro],
  ["Cupcakes", "Pequenos detalhes, grandes momentos.", photos.cupcakes],
];

function Categories({ go }: { go: (view: View) => void }) {
  return <section className="section categories"><SectionHeader align="center" eyebrow="ESCOLHA POR CATEGORIA" title={<>O que você deseja <em>celebrar?</em></>} />
    <div className="category-grid">{categories.map(([name, description, image], index) => <article className={`category-card category-${index + 1}`} key={name}><img src={image} alt={name} /><div className="category-overlay"><span>0{index + 1}</span><Title level={3}>{name}</Title><p>{description}</p><Link onClick={() => go("catalogo")} className="text-link">Conhecer <Icon name="arrow" size={18} /></Link></div></article>)}</div>
  </section>;
}

const sizes = {
  PP: { slices: "8 a 10 pedaços", price: "R$ 165", diameter: "12 cm" },
  P: { slices: "15 a 18 pedaços", price: "R$ 220", diameter: "16 cm" },
  M: { slices: "25 a 30 pedaços", price: "R$ 295", diameter: "20 cm" },
  G: { slices: "40 a 45 pedaços", price: "Sob consulta", diameter: "25 cm" },
};

function NakedFeature({ go }: { go: (view: View) => void }) {
  const [size, setSize] = useState<keyof typeof sizes>("P");
  return <section className="naked-section">
    <div className="naked-image"><img src={photos.dark} alt="Naked cake de chocolate com acabamento artesanal" /><span className="vertical-label">CAMADAS DE SABOR</span></div>
    <div className="naked-content"><SectionHeader eyebrow="ASSINATURA DA CASA" title={<>Naked cake,<br /><em>naturalmente irresistível.</em></>} text="Três camadas de bolo, duas generosas camadas de recheio e brigadeiro cremoso na cobertura. Envolto em lâmina de acetato para chegar impecável." />
      <div className="feature-list"><span>03 <small>camadas de bolo</small></span><span>02 <small>camadas de recheio</small></span><span>01 <small>criação exclusiva</small></span></div>
      <div className="selector-label"><strong>Escolha o tamanho</strong><small>Selecione para ver os detalhes</small></div>
      <div className="size-selector">{(Object.keys(sizes) as (keyof typeof sizes)[]).map((item) => <Button key={item} variant="ghost" className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</Button>)}</div>
      <div className="size-result"><span><small>Rendimento</small>{sizes[size].slices}</span><span><small>Diâmetro</small>{sizes[size].diameter}</span><span><small>A partir de</small>{sizes[size].price}</span></div>
      <Button onClick={() => go("produto")}>Personalizar meu Naked Cake <Icon name="arrow" size={18} /></Button>
      <p className="fine-print">* Valores base. O orçamento final varia conforme sabores e decoração.</p>
    </div>
  </section>;
}

function CustomCakes({ go }: { go: (view: View) => void }) {
  const [modal, setModal] = useState<number | null>(null);
  const gallery = [
    { image: photos.floral, name: "Floral orgânico", text: "Flores naturais, volumes delicados e uma composição criada para o seu evento." },
    { image: photos.pink, name: "Pintura delicada", text: "Pinceladas artesanais e uma paleta desenvolvida a partir da sua referência." },
    { image: photos.white, name: "Minimalismo botânico", text: "Texturas naturais, folhagens e a beleza sofisticada do essencial." },
  ];
  return <section className="section custom-cakes"><div className="custom-heading"><SectionHeader eyebrow="CRIAÇÕES SOB MEDIDA" title={<>Sua ideia,<br /><em>nossa arte.</em></>} text="Transformamos referências, ideias e momentos em uma criação verdadeiramente única." /><div className="tag-cloud">{["Floral", "Pasta americana", "Pinturas", "Cores", "Glitter", "Sabores"].map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    <div className="editorial-gallery">{gallery.map((item, index) => <button className={`gallery-item item-${index + 1}`} key={item.name} onClick={() => setModal(index)}><img src={item.image} alt={item.name} /><span>{item.name}<Icon name="plus" /></span></button>)}</div>
    <div className="center-action"><Button variant="secondary" onClick={() => go("showroom")}>Ver todas as criações <Icon name="arrow" size={18} /></Button></div>
    {modal !== null && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" onClick={(e) => e.stopPropagation()}><Button variant="light" className="modal-close" onClick={() => setModal(null)}><Icon name="close" /></Button><img src={gallery[modal].image} alt={gallery[modal].name} /><div className="modal-copy"><span className="eyebrow">INSPIRAÇÃO</span><Title level={2}>{gallery[modal].name}</Title><p>{gallery[modal].text}</p><Button onClick={() => { setModal(null); go("orcamento"); }}>Quero algo parecido <Icon name="arrow" size={18} /></Button></div></div></div>}
  </section>;
}

function ProductCard({ product, go }: { product: typeof products[number]; go: (view: View) => void }) {
  return <article className="product-card"><div className="product-image"><img src={product.image} alt={product.name} /><span className="badge">{product.category}</span></div><div className="product-info"><Title level={3}>{product.name}</Title><p>{product.detail}</p><div><strong>{product.price}</strong><Button variant="ghost" onClick={() => go("produto")}>Ver detalhes <Icon name="arrow" size={17} /></Button></div></div></article>;
}

function Sweets() {
  const [sweetCount, setSweetCount] = useState("24 unidades");
  const [cupCount, setCupCount] = useState(10);
  return <><section id="doces" className="section sweets">
    <SectionHeader eyebrow="PEQUENOS PRAZERES" title={<>Doces feitos para<br /><em>compartilhar.</em></>} text="Receitas clássicas, ingredientes selecionados e o ponto perfeito em cada unidade." />
    <div className="sweet-layout"><div className="sweet-photo"><img src={photos.brigadeiro} alt="Seleção de brigadeiros artesanais" /></div><div className="sweet-options"><div className="option-top"><span className="badge">CAIXAS</span><div className="segmented">{["24 unidades", "50 unidades"].map((x) => <Button key={x} variant="ghost" className={sweetCount === x ? "selected" : ""} onClick={() => setSweetCount(x)}>{x}</Button>)}</div></div>{["Brigadeiro Tradicional", "Beijinho", "Ninho"].map((x, i) => <div className="sweet-row" key={x}><span>0{i + 1}</span><strong>{x}</strong><small>{i === 0 ? "Cacau 50% e granulado belga" : i === 1 ? "Coco fresco e leite condensado" : "Leite Ninho e toque de baunilha"}</small></div>)}<Button>Solicitar orçamento · {sweetCount} <Icon name="arrow" size={18} /></Button></div></div>
  </section>
  <section id="cupcakes" className="cupcake-band"><div><span className="eyebrow">CUPCAKES ARTESANAIS</span><Title level={2}>Pequenos no tamanho.<br /><em>Enormes nos detalhes.</em></Title><p>Grande ou mini, com recheio de brigadeiro ou creme de Ninho e cobertura delicada de buttercream.</p><div className="minimum">PEDIDO MÍNIMO <strong>10 unidades</strong></div><div className="stepper"><Button variant="ghost" onClick={() => setCupCount(Math.max(10, cupCount - 5))}><Icon name="minus" /></Button><strong>{cupCount}</strong><Button variant="ghost" onClick={() => setCupCount(cupCount + 5)}><Icon name="plus" /></Button><span>unidades</span></div><Button variant="light">Montar meu pedido <Icon name="arrow" size={18} /></Button></div><img src={photos.cupcake} alt="Cupcake de chocolate com acabamento premium" /></section></>;
}

const steps = [
  ["Escolha sua inspiração", "Explore nossos produtos e referências."],
  ["Defina os detalhes", "Escolha tamanho, sabores e personalizações."],
  ["Solicite seu orçamento", "Envie sua ideia pelo WhatsApp."],
  ["Finalizamos juntos", "Confirmamos disponibilidade, prazo, entrega e pagamento."],
];

function AboutProcess() {
  return <><section id="sobre" className="about-section"><div className="about-copy"><SectionHeader eyebrow="NOSSA HISTÓRIA" title={<>Feito para transformar<br />momentos em <em>memórias.</em></>} text="Desde 2019, a Graziela Pires Confeitaria une técnica, afeto e olhar artístico para criar bolos e doces personalizados em Foz do Iguaçu." /><blockquote>“Cada bolo carrega uma história. Nosso trabalho é torná-la ainda mais bonita — e deliciosa.”</blockquote><span className="signature">Graziela Pires</span></div><div className="about-image"><img src={photos.baker} alt="Processo artesanal de criação de um bolo" /><div className="year-mark"><strong>2019</strong><span>ONDE TUDO COMEÇOU</span></div></div><div className="timeline-mini">{["Início da confeitaria", "Crescimento", "Personalização", "Experiência atual"].map((item, i) => <div key={item}><span>0{i + 1}</span><p>{item}</p></div>)}</div></section>
  <section id="processo" className="section process"><SectionHeader align="center" eyebrow="DO SONHO À MESA" title={<>Como funciona</>} text="Um processo simples, próximo e inteiramente personalizado." /><div className="steps">{steps.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><i /><Title level={3}>{title}</Title><p>{text}</p></article>)}</div></section></>;
}

const faqs = [
  ["Posso misturar sabores?", "Sim. Dependendo do tamanho escolhido, é possível combinar recheios para criar uma experiência única."],
  ["As decorações alteram o valor?", "Sim. O valor final considera o nível de detalhe, técnicas, materiais e tempo necessário para a criação."],
  ["Quais tamanhos estão disponíveis?", "Trabalhamos com tamanhos PP, P, M e G, com rendimento aproximado de 8 a 45 pedaços."],
  ["Quais formas de pagamento são aceitas?", "As condições de pagamento são confirmadas junto com o orçamento final pelo WhatsApp."],
  ["Como funciona a entrega?", "A retirada e a possibilidade de entrega em Foz do Iguaçu são combinadas conforme data e localização."],
  ["Qual é o prazo para fazer o pedido?", "Recomendamos antecedência mínima de 7 dias. Datas especiais podem exigir um prazo maior."],
  ["Posso enviar uma referência de outro bolo?", "Claro. Usamos sua referência como ponto de partida para criar uma versão autoral e personalizada."],
  ["Existe quantidade mínima para cupcakes?", "Sim, o pedido mínimo é de 10 unidades por sabor e tamanho."],
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return <section className="section faq"><SectionHeader eyebrow="PERGUNTAS FREQUENTES" title={<>Antes de fazer<br /><em>seu pedido.</em></>} text="Reunimos as principais informações para tornar sua escolha mais simples." /><div className="accordion">{faqs.map(([question, answer], index) => <article className={open === index ? "open" : ""} key={question}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><Icon name={open === index ? "minus" : "plus"} /></button><div className="answer"><p>{answer}</p></div></article>)}</div></section>;
}

function Instagram({ go }: { go: (view: View) => void }) {
  const images = [photos.floral, photos.chocolate, photos.cupcake, photos.white, photos.brigadeiro];
  return <section className="instagram-section"><div className="instagram-head"><div><span className="eyebrow">ACOMPANHE NOSSO DIA A DIA</span><Title level={2}>Mais criações no Instagram</Title></div><Button variant="secondary"><Icon name="instagram" /> @grazielapiresconfeitaria</Button></div><div className="insta-grid">{images.map((image, i) => <Link key={image} className={`insta-${i + 1}`}><img src={image} alt={`Criação artesanal ${i + 1}`} /><span><Icon name="instagram" /> Ver publicação</span></Link>)}</div><div className="final-cta"><span className="eyebrow">SUA IDEIA COMEÇA AQUI</span><Title level={2}>Vamos criar algo especial<br />para o seu momento?</Title><p>Conte como você imagina seu bolo e vamos transformar sua ideia em uma criação única.</p><div className="button-row"><Button variant="light" onClick={() => go("orcamento")}>Solicitar orçamento <Icon name="arrow" /></Button><Button variant="ghost" onClick={() => go("orcamento")}><Icon name="whatsapp" /> Falar pelo WhatsApp</Button></div></div></section>;
}

function Home({ go }: { go: (view: View, anchor?: string) => void }) {
  return <><Hero go={go} /><Categories go={go} /><CompactJourney go={go} /><CompactShowcase go={go} /></>;
}

function CompactJourney({ go }: { go: (view: View) => void }) {
  return <section id="processo" className="compact-journey">
    <div className="compact-journey-copy" id="sobre">
      <span className="eyebrow">SIMPLES E PERSONALIZADO</span>
      <Title level={2}>Da sua ideia<br /><em>à celebração.</em></Title>
      <p>Você conta o que imagina. Nós cuidamos dos sabores, do acabamento e de cada detalhe.</p>
      <Button onClick={() => go("orcamento")}>Começar pedido <Icon name="arrow" size={18} /></Button>
    </div>
    <div className="compact-steps">
      {steps.slice(0, 3).map(([title, text], index) => <article key={title}><span>0{index + 1}</span><div><Title level={3}>{title}</Title><p>{text}</p></div></article>)}
    </div>
  </section>;
}

function CompactShowcase({ go }: { go: (view: View) => void }) {
  return <section className="compact-showcase">
    <div className="showcase-image"><img src={photos.floral} alt="Bolo personalizado com flores naturais" /></div>
    <div className="showcase-copy">
      <span className="eyebrow">CRIAÇÕES AUTORAIS</span>
      <Title level={2}>Feito para ser<br /><em>inesquecível.</em></Title>
      <p>Veja inspirações reais e encontre o estilo do seu próximo bolo.</p>
      <div className="button-row"><Button variant="light" onClick={() => go("showroom")}>Ver showroom <Icon name="arrow" /></Button><Button variant="ghost" onClick={() => go("orcamento")}><Icon name="whatsapp" /> Pedir orçamento</Button></div>
    </div>
  </section>;
}

function PageHero({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text: string }) {
  return <section className="page-hero"><span className="eyebrow">{eyebrow}</span><Title level={1}>{title}</Title><p>{text}</p></section>;
}

function Catalog({ go }: { go: (view: View) => void }) {
  const [category, setCategory] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = category === "Todos" ? products : products.filter((p) => p.category === category);
  return <><PageHero eyebrow="CATÁLOGO" title={<>Criações para<br /><em>cada celebração.</em></>} text="Explore sabores, estilos e possibilidades. Tudo pode ser personalizado para o seu momento." />
    <main className="catalog-page"><div className="filter-tabs">{["Todos", "Naked Cake", "Bolos Personalizados", "Doces", "Cupcakes"].map((item) => <Button key={item} variant="ghost" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</Button>)}<Button variant="secondary" onClick={() => setFiltersOpen(!filtersOpen)}>Filtros <Icon name="chevron" /></Button></div>
    {filtersOpen && <div className="filter-panel">{["Tamanho", "Faixa de preço", "Sabor", "Decoração"].map((label) => <label key={label}><span>{label}</span><select defaultValue=""><option value="" disabled>Todos</option><option>Clássico</option><option>Personalizado</option></select></label>)}<Button>Aplicar filtros</Button></div>}
    <div className="catalog-meta"><span>{filtered.length} criações</span><small>Valores iniciais sujeitos à personalização</small></div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.name} product={product} go={go} />)}</div></main></>;
}

function ChoiceGroup({ label, options, value, setValue }: { label: string; options: string[]; value: string; setValue: (value: string) => void }) {
  return <div className="choice-group"><strong>{label}</strong><div>{options.map((option) => <Button key={option} variant="ghost" className={value === option ? "selected" : ""} onClick={() => setValue(option)}>{option}</Button>)}</div></div>;
}

function ProductDetail({ go }: { go: (view: View) => void }) {
  const [size, setSize] = useState("P");
  const [dough, setDough] = useState("Chocolate");
  const [filling, setFilling] = useState("Brigadeiro");
  const [decor, setDecor] = useState("Frutas frescas");
  const [mainImage, setMainImage] = useState(photos.chocolate);
  const price = size === "PP" ? 165 : size === "P" ? 220 : size === "M" ? 295 : 390;
  const detailImages = [photos.chocolate, photos.dark, photos.birthday];
  return <main className="detail-page"><div className="breadcrumbs">CATÁLOGO / NAKED CAKE / <strong>NAKED CLÁSSICO</strong></div><div className="detail-grid">
    <div className="detail-gallery"><img className="detail-main" src={mainImage} alt="Naked Cake Clássico" /><div>{detailImages.map((image) => <button key={image} onClick={() => setMainImage(image)} className={mainImage === image ? "selected" : ""}><img src={image} alt="Variação do naked cake" /></button>)}</div></div>
    <div className="detail-config"><span className="badge">NAKED CAKE</span><Title level={1}>Naked Clássico</Title><p className="lead">Camadas macias, recheio cremoso e finalização artesanal. Uma base elegante para você personalizar.</p><ChoiceGroup label="1. Tamanho" options={["PP", "P", "M", "G"]} value={size} setValue={setSize} /><ChoiceGroup label="2. Massa" options={["Baunilha", "Chocolate", "Red Velvet"]} value={dough} setValue={setDough} /><ChoiceGroup label="3. Recheio" options={["Brigadeiro", "Ninho", "Doce de leite"]} value={filling} setValue={setFilling} /><ChoiceGroup label="4. Decoração" options={["Frutas frescas", "Doces", "Flores"]} value={decor} setValue={setDecor} />
    </div>
    <aside className="order-summary"><span className="eyebrow">RESUMO</span><Title level={2}>Seu bolo</Title>{[["Tamanho", `${size} · ${sizes[size as keyof typeof sizes].slices}`], ["Massa", dough], ["Recheio", filling], ["Decoração", decor]].map(([a, b]) => <div className="summary-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}<div className="estimate"><span>Valor estimado</span><strong>R$ {price},00</strong><small>Preço base, sujeito à confirmação.</small></div><Button onClick={() => go("orcamento")}><Icon name="whatsapp" /> Solicitar pelo WhatsApp</Button><p>Sem pagamento agora. Finalizamos todos os detalhes pessoalmente.</p></aside>
  </div><div className="detail-note"><strong>O que você precisa saber</strong><p>Produção artesanal sob encomenda · Conservar refrigerado · Retirar da geladeira 30 minutos antes de servir · Decorações podem alterar o valor final.</p></div></main>;
}

function Showroom() {
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState<typeof products[number] | null>(null);
  const items = [...products, { ...products[0], name: "Chocolate Botânico", image: photos.dark }, { ...products[4], name: "Mini Cupcakes", image: photos.cupcakes }];
  const shown = filter === "Todos" ? items : items.filter((x) => x.category.includes(filter));
  return <><PageHero eyebrow="NOSSO SHOWROOM" title={<>Uma coleção de<br /><em>momentos doces.</em></>} text="Inspire-se em criações que já fizeram parte de histórias especiais." /><main className="showroom"><div className="filter-tabs">{["Todos", "Naked", "Personalizados", "Doces", "Cupcakes"].map((x) => <Button key={x} variant="ghost" className={filter === x ? "selected" : ""} onClick={() => setFilter(x)}>{x}</Button>)}</div><div className="masonry">{shown.map((item, index) => <button className={`masonry-item masonry-${index % 4}`} key={`${item.name}-${index}`} onClick={() => setSelected(item)}><img src={item.image} alt={item.name} /><span><small>GRAZIELA PIRES · FOZ DO IGUAÇU</small><strong>{item.name}</strong></span></button>)}</div></main>{selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={(e) => e.stopPropagation()}><Button variant="light" className="modal-close" onClick={() => setSelected(null)}><Icon name="close" /></Button><img src={selected.image} alt={selected.name} /><div className="modal-copy"><span className="eyebrow">FEITO POR GRAZIELA PIRES</span><Title>{selected.name}</Title><p>{selected.detail}</p><Button>Quero algo parecido <Icon name="arrow" /></Button></div></div></div>}</>;
}

function Field({ label, type = "text", placeholder, children, full = false }: { label: string; type?: string; placeholder?: string; children?: ReactNode; full?: boolean }) {
  return <label className={`field ${full ? "full" : ""}`}><span>{label}</span>{children || <input type={type} placeholder={placeholder} />}</label>;
}

function QuotePage() {
  const [sent, setSent] = useState(false);
  return <main className="quote-page"><div className="quote-intro"><span className="eyebrow">ORÇAMENTO RÁPIDO</span><Title level={1}>Conte o<br /><em>essencial.</em></Title><p>Leva menos de 2 minutos. Os detalhes finais são combinados diretamente pelo WhatsApp.</p><div className="quote-points"><div><span>01</span><p><strong>Sem compromisso</strong>Receba uma estimativa inicial.</p></div><div><span>02</span><p><strong>Atendimento humano</strong>Continue a conversa no WhatsApp.</p></div></div></div>
    <form className="quote-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <div className="form-heading"><span>01</span><div><Title level={3}>Seu pedido</Title><p>Só precisamos destas informações para começar.</p></div></div>
      <div className="form-grid"><Field label="Nome completo" placeholder="Como podemos chamar você?" /><Field label="WhatsApp" placeholder="(45) 99999-9999" /><Field label="Data desejada" type="date" /><Field label="Tipo de produto"><select defaultValue=""><option value="" disabled>Selecione</option><option>Naked Cake</option><option>Bolo personalizado</option><option>Doces</option><option>Cupcakes</option></select></Field></div>
      <div className="form-grid quote-details"><Field label="Conte sua ideia" full><textarea placeholder="Ex.: bolo para 20 pessoas, tema floral e recheio de brigadeiro..." rows={4} /></Field></div>
      <div className="form-submit"><p>Você continuará o atendimento pelo WhatsApp.</p><Button type="submit"><Icon name="whatsapp" /> Continuar no WhatsApp</Button></div>{sent && <div className="success-message"><strong>Solicitação preparada!</strong><span>Seu atendimento continuará pelo WhatsApp.</span></div>}
    </form></main>;
}

function Footer({ go }: { go: (view: View, anchor?: string) => void }) {
  return <footer><div className="footer-top"><Logo light /><p>Bolos e doces artesanais personalizados para celebrar histórias únicas.</p><div className="footer-social"><Button variant="ghost"><Icon name="instagram" /></Button><Button variant="ghost"><Icon name="whatsapp" /></Button></div></div><div className="footer-links"><div><strong>EXPLORE</strong><Link onClick={() => go("home")}>Início</Link><Link onClick={() => go("catalogo")}>Produtos</Link><Link onClick={() => go("showroom")}>Showroom</Link></div><div><strong>INFORMAÇÕES</strong><Link onClick={() => go("home", "sobre")}>Sobre</Link><Link onClick={() => go("home", "processo")}>Como funciona</Link><Link onClick={() => go("orcamento")}>Contato</Link></div><div><strong>ATENDIMENTO</strong><span>Foz do Iguaçu — Paraná</span><span>Ter a Sáb · 9h às 18h</span><Link>WhatsApp: (45) 99999-9999</Link></div></div><div className="footer-bottom"><span>© 2025 Graziela Pires Confeitaria</span><span>Feito artesanalmente em Foz do Iguaçu</span></div></footer>;
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => setProgress((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const go = (next: View, anchor?: string) => {
    setView(next);
    requestAnimationFrame(() => {
      if (anchor && next === "home") document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };
  const content = useMemo(() => {
    if (view === "catalogo") return <Catalog go={go} />;
    if (view === "produto") return <ProductDetail go={go} />;
    if (view === "showroom") return <Showroom />;
    if (view === "orcamento") return <QuotePage />;
    return <Home go={go} />;
  }, [view]);
  return <div className="app"><div className="scroll-progress" style={{ transform: `scaleX(${progress / 100})` }} /><Navbar go={go} />{content}<Footer go={go} /><Button className="whatsapp-float" onClick={() => go("orcamento")}><Icon name="whatsapp" size={24} /><span>Fale conosco</span></Button></div>;
}
