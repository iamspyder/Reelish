// Independent caption presets based on publicly observable visual characteristics.
// Values are expressed in Reelish's 1920px reference canvas, not Captik runtime code.
(function(global){
const base={font:'Inter',weight:800,size:78,color:'#ffffff',highlight:'#a0d83e',animation:'highlight',position:76,xPosition:50,bold:true,uppercase:false,box:false,shadow:true,outline:2,italic:false,letterSpacing:0,lineHeight:1.05,activeScale:1.12,activeBox:false,boxColor:'#111111',boxOpacity:.7,lines:2,wordsPerLine:4};
const specs=[
['captik_glow','Captik Glow','Dynamic',{animation:'glow',highlight:'#a0d83e',activeScale:1.55,uppercase:true}],
['ali_abdaal','Ali Abdaal','Clean',{font:'Poppins',weight:700,size:68,activeBox:true,boxColor:'#ffffff',highlight:'#111111',activeScale:1.05,outline:0}],
['captik_shadow','Captik Shadow','Dynamic',{animation:'highlight',highlight:'#ffffff',activeScale:1.7,outline:0,mutedOpacity:.32}],
['captik','Captik','Dynamic',{highlight:'#c8ff00',activeScale:1.55,uppercase:true,outline:0}],
['clean_motion','Clean Motion','Clean',{animation:'word',weight:500,size:72,outline:0,highlight:'#ffffff',activeScale:1}],
['bubble','Bubble Style','Clean',{font:'Times New Roman',weight:600,activeBox:true,boxColor:'#48a680',highlight:'#111111',outline:0,activeScale:1.12}],
['hormozi','Hormozi Style','Bold',{font:'Anton',weight:400,size:96,highlight:'#a5fd4b',uppercase:true,activeScale:1.6,outline:3}],
['boxed','Editing Skool','Bold',{activeBox:true,boxColor:'#f48601',highlight:'#ffffff',uppercase:true,activeScale:1.3,outline:0}],
['mrbeast','Mr Beast Style 1','Bold',{font:'Luckiest Guy',weight:400,size:94,highlight:'#ffffff',uppercase:true,outline:7,activeScale:1.45}],
['mr_beast_2','Mr Beast Style 2','Bold',{font:'Montserrat',weight:900,size:88,highlight:'#ffd700',uppercase:true,outline:2,activeScale:1.4}],
['iman_gadzhi','Iman Gadzhi','Clean',{font:'Montserrat',weight:600,size:67,uppercase:true,animation:'fade',outline:0,letterSpacing:2.5,activeScale:1}],
['prism','Devin Jatho','Dynamic',{font:'Montserrat',color:'#a34eff',highlight:'#a34eff',size:84,uppercase:true,activeScale:1.5,outline:0}],
['highlighted_word','Highlighted Word','Bold',{font:'Montserrat',weight:600,highlight:'#f5a623',activeScale:1.35,outline:0}],
['clean_glow','Clean Glow Style','Clean',{weight:400,animation:'glow',highlight:'#ffffff',outline:0,activeScale:1}],
['captik_clean','Captik Clean','Clean',{weight:400,animation:'none',outline:0,activeScale:1,size:66}],
['black_punch','Black Punch','Bold',{font:'Anton',weight:400,color:'#111111',highlight:'#111111',size:100,uppercase:true,outline:0,activeScale:1.55,animation:'pop'}],
['captik_word','Captik Word','Dynamic',{animation:'typewriter',weight:600,outline:0,activeScale:1}],
['pixelated','Pixelated Word','Dynamic',{font:'Press Start 2P',weight:400,animation:'word',size:62,uppercase:true,letterSpacing:3,outline:0}],
['liquid_glass','Liquid Glass','Clean',{font:'Montserrat',weight:400,size:62,box:true,boxColor:'#637083',boxOpacity:.35,outline:0,highlight:'#ffffff',activeScale:1}],
['tabahi','Tabahi','Bold',{font:'Luckiest Guy',weight:400,uppercase:true,outline:7,animation:'bounce',size:92,activeScale:1.3}],
['deep_glow','Deep Glow','Dynamic',{font:'Montserrat',weight:900,color:'#ff00ff',highlight:'#ff00ff',animation:'glow',size:100,uppercase:true,outline:0}],
['seedha_saadha','Seedha Saadha','Bold',{font:'Rubik',weight:900,size:108,uppercase:true,outline:6,animation:'word',highlight:'#ffffff'}],
['thora_cinematic','Thora Cinematic','Clean',{font:'Montserrat',weight:600,size:56,uppercase:true,letterSpacing:5,animation:'fade',outline:0,activeScale:1}],
['delhi','Delhi','Editorial',{font:'Instrument Serif',weight:400,size:94,italic:true,highlight:'#ffffff',animation:'glow',outline:0,activeScale:1.3}],
['illusion','Illusion','Editorial',{font:'Open Sans',weight:900,size:86,highlight:'#ffffff',activeScale:1.85,outline:0}],
['editor_masala','Editor Masala','Editorial',{font:'Montserrat',weight:900,size:94,highlight:'#ffd700',activeScale:1.75,outline:1}],
['aura','Aura','Editorial',{font:'Playfair Display',weight:600,italic:true,highlight:'#7fd3ff',size:98,activeScale:1.4,outline:0}],
['aura_helvetica','Swiss','Editorial',{font:'Inter',weight:900,highlight:'#f5d300',size:94,activeScale:1.4,outline:0}],
['big_reveal','Big Reveal','Depth inspired',{font:'Montserrat',weight:900,highlight:'#ffe800',size:130,position:40,uppercase:true,activeScale:1.5,outline:0}],
['big_red','The Big Red','Editorial',{font:'Instrument Serif',weight:400,color:'#d53e3e',highlight:'#e68c8c',size:134,uppercase:true,outline:0}],
['scribble','Scribble','Handwritten',{font:'Caveat',weight:700,size:100,activeBox:true,boxColor:'#ffe042',highlight:'#241c12',outline:0,animation:'bounce'}],
['archives','Archives','Handwritten',{font:'Kaushan Script',weight:400,color:'#e1cdc2',highlight:'#e1cdc2',size:90,outline:0,animation:'fade'}],
['blockbuster','Blockbuster','Editorial',{font:'Bebas Neue',weight:400,color:'#fa232d',highlight:'#ffffff',size:130,uppercase:true,animation:'slide',outline:0}],
['journal','Journal','Handwritten',{font:'Caveat',weight:700,highlight:'#ffda00',size:90,animation:'typewriter',outline:0}],
['interlock','Interlock','Editorial',{font:'Inter',weight:600,color:'#f7f4ee',highlight:'#d7a7fe',size:92,animation:'slide',outline:0}]
];
const extras=[['Reelish Focus','Focus',{font:'Montserrat',highlight:'#ffb546',animation:'highlight',activeBox:true,boxColor:'#ffb546',activeScale:1.25}],['Reelish Noir','Focus',{font:'Bebas Neue',weight:400,size:110,animation:'word',outline:0}],['Reelish Story','Editorial',{font:'Playfair Display',italic:true,highlight:'#e7c59c',animation:'fade',outline:0}],['Reelish Pulse','Dynamic',{font:'Anton',weight:400,highlight:'#7edaff',animation:'bounce',size:98}],['Reelish Readable','Accessible',{font:'Noto Sans',weight:700,size:78,box:true,boxColor:'#000000',boxOpacity:.9,animation:'none',outline:0}],['Reelish Hindi','Accessible',{font:'Noto Sans Devanagari',weight:700,size:82,highlight:'#ffbf43',animation:'highlight',outline:0}]];
// Named commercial families retain explicit open-font substitutes. Public OFL
// families resolve to their own bundled typeface rather than a generic lookalike.
const fontFallbacks={ClashDisplay:'Montserrat',HelveticaBold:'Inter',DrukWide:'Archivo Black',TheBoldFont:'Montserrat',KomikaAxis:'Luckiest Guy',Futura:'Montserrat'};
const aliasFont=value=>{const name=String(value||'Inter').split(',')[0].replace(/["']/g,'').trim();return ({...fontFallbacks,InterStory:'Inter',PoppinsStory:'Poppins',PoppinsBold:'Poppins',MontserratSemiBold:'Montserrat',BebasNeue:'Bebas Neue',InstrumentSerif:'Instrument Serif',InstrumentSerifItalic:'Instrument Serif',InstrumentSans:'Instrument Sans',MonaSans:'Mona Sans',RubikBlack:'Rubik',LuckiestGuy:'Luckiest Guy',ArchivoBlack:'Archivo Black',Gloock:'Gloock',Caveat:'Caveat',KaushanScript:'Kaushan Script',SpecialElite:'Special Elite',PressStart2P:'Press Start 2P',RubikSprayPaint:'Rubik Spray Paint',Baloo2:'Baloo 2',BagelFatOne:'Bagel Fat One',AbrilFatface:'Abril Fatface',PinyonScript:'Pinyon Script',Mynerve:'Mynerve',GreatVibes:'Great Vibes',Roboto:'Roboto',TimesNewRomanBold:'Times New Roman',GloriaHallelujah:'Gloria Hallelujah',BlackHanSans:'Black Han Sans',FredokaOne:'Fredoka One',DancingScript:'Dancing Script',BBHBartle:'BBH Bartle'})[name]||name;};

global.CliporaPresets={base,aliasFont,fontFallbacks,templates:specs.map(([id,name,category,style])=>({id,name,category,source:'Reference look',style:{...base,...style,templateId:id}})),extras:extras.map(([name,category,style],i)=>({id:'clipora_'+i,name,category,source:'Reelish original',style:{...base,...style,templateId:'clipora_'+i}}))};
})(typeof window==='undefined'?globalThis:window);
