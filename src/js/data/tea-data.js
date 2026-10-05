/* ═════════ Reference data: the source of truth for tea ═════════ */
// Liquor colours, ordered as a spectrum from pale green through gold, amber, red and brown.
const LIQ = [
 ['celadon','Pale celadon','#E4E7BC'],['spring','Spring green','#D4DD93'],['jade','Jade','#C0CB66'],['emerald','Sencha green','#A7B542'],['matcha','Matcha','#7FA03A'],['olive','Olive gold','#ABA34A'],
 ['ivory','Ivory','#EFE8C6'],['pale','Pale straw','#E9DCA4'],['straw','Straw','#E3CD78'],['lemon','Lemon gold','#DEBF4E'],
 ['gold','Gold','#D6A63A'],['honey','Honey','#CC8F2E'],['amber','Amber','#BC7428'],['orange','Burnt orange','#AE5D20'],['copper','Copper','#984A1F'],
 ['brick','Brick','#843822'],['ruby','Ruby','#80261B'],['garnet','Garnet','#681D17'],['chestnut','Chestnut','#6B3417'],['mahogany','Mahogany','#4F200F'],['espresso','Espresso','#36170C'],['ebony','Ebony','#22100A'],
 ['milky','Milky tan','#C9A27A'],['rose','Rose','#C2566E'],['hibiscus','Hibiscus','#9C2246']
];
const LIQM = Object.fromEntries(LIQ.map(([id,n,h])=>[id,{id,n,h}]));
const liqHex = id=>LIQM[id]?.h||'#C9A24A';

// Brewing methods. Only the methods listed for a tea type are offered for it.
const STY = [
 ['gongfu','Gongfu','Lots of leaf, small vessel, many short infusions'],
 ['kyusu','Kyusu','Japanese side-handle pot, poured in rotation'],
 ['western','Western pot','Less leaf, big pot, one to three long steeps'],
 ['glass','Glass / grandpa','Leaf loose in a glass, topped up as you drink'],
 ['whisked','Usucha (whisked)','Thin matcha whisked to a foam'],
 ['koicha','Koicha','Thick matcha kneaded to a paste'],
 ['cold','Cold brew','Steeped in the fridge for hours'],
 ['ice','Ice brew','Kōridashi: leaf under ice, melted slowly'],
 ['iced','Hot onto ice','Brewed strong, poured over ice'],
 ['simmer','Simmered','Boiled on the stove']
];
const STYLE = Object.fromEntries(STY.map(([k,v])=>[k,v]));
const STYLE_DESC = Object.fromEntries(STY.map(([k,,d])=>[k,d]));
const HOT = ['gongfu','western','kyusu','glass','iced'];
const STYLE_VESSELS = {gongfu:['gaiwan','yixing'],kyusu:['kyusu','houhin','shibo'],western:['porcelain','glass','mug'],glass:['tumbler','glass'],whisked:['chawan'],koicha:['chawan'],cold:['jar'],ice:['houhin','shibo','glass'],iced:['porcelain','glass'],simmer:['saucepan']};

const M = (t,g,ml,sched,x={})=>({t,g,ml,sched,...x});
const COLD = (g,h=8,ml=1000)=>M([2,8],g,ml,[h*3600],{inf:[1,1]});

// Families. dry: [leaf colour, drawing form]. methods: the brewing methods traditional for the family.
const FAMS = [
 {id:'green',name:'Chinese & Korean green',native:'绿茶 · lǜ chá',ox:'Unoxidized',proc:'Pan-fired or baked (shāqīng) to stop oxidation, then shaped.',leaf:'Whole buds and young leaves; flat, curled, twisted or needle-shaped',dry:['#6F8B3B','leaf'],liqs:['celadon','spring','jade','pale','olive'],common:['chestnut','snap pea','fresh grass','butter','toasted grain'],
  tips:['Brew cooler if it turns bitter.','Best within a year of harvest; store sealed and cool.'],
  methods:{glass:M([75,85],[3,4],250,[120,120,150],{inf:[2,3]}),gongfu:M([75,85],[4,5],100,[20,25,30,45,60]),western:M([75,80],[2,3],300,[150,180,240]),cold:COLD([8,10])}},
 {id:'jpgreen',name:'Japanese green',native:'日本茶 · nihoncha',ox:'Unoxidized',proc:'Steamed (mushi) to stop oxidation, then rolled and dried into needles.',leaf:'Fine, glossy needles; deep-steamed teas break into smaller pieces',dry:['#3F6B2A','needle'],liqs:['spring','jade','emerald','matcha','olive'],common:['umami','seaweed','fresh grass','snap pea','butter'],
  tips:['Pour out every last drop; the final drops carry the most flavour.','Store in the fridge once opened, sealed against moisture and smells.'],
  methods:{kyusu:M([70,80],[4,6],180,[60,15,30,60]),cold:COLD([10,12],3),ice:M([0,2],[8,10],150,[5400],{inf:[1,1]})}},
 {id:'white',name:'White',native:'白茶 · bái chá',ox:'Lightly oxidized (5–10%)',proc:'Withered and dried only; nothing else.',leaf:'Downy buds (needles) or bud-and-leaf sets; pressed into cakes when aged',dry:['#B8B39A','bud'],liqs:['ivory','pale','straw','lemon'],common:['honey','fresh grass','dried fruit','cane','medicinal'],
  tips:['Ages well: “one year tea, three years medicine, seven years treasure.”'],
  methods:{gongfu:M([85,95],[5,6],100,[25,25,35,45,60,90,120,180]),western:M([85,90],[3,4],300,[240,300,360]),cold:COLD([8,10])}},
 {id:'yellow',name:'Yellow',native:'黄茶 · huáng chá',ox:'Lightly oxidized',proc:'Green-tea processing plus mènhuáng, a smothered yellowing step.',leaf:'Buds or bud-and-leaf, yellow-green and downy',dry:['#9A9A4A','bud'],liqs:['pale','straw','lemon','spring'],common:['cane','butter','chestnut','stone fruit'],
  tips:['Look for sweet corn and soft fruit rather than grass.'],
  methods:{glass:M([80,85],[3,4],250,[120,150,180],{inf:[2,3]}),gongfu:M([80,85],[4,5],100,[25,25,30,40,55,75])}},
 {id:'scented',name:'Scented',native:'花茶 · huā chá',ox:'Varies with the base tea',proc:'Base tea layered with fresh blossoms overnight, many times over.',leaf:'Hand-rolled pearls, needles or twisted leaf',dry:['#7A7A4A','ball'],liqs:['pale','straw','lemon','gold'],common:['jasmine','osmanthus','honey','orchid'],
  tips:['Too hot and the flower turns soapy.','Good scenting smells of fresh flowers, not perfume.'],
  methods:{gongfu:M([80,90],[4,5],100,[30,20,30,45,60]),western:M([80,85],[2.5,3],300,[180,240]),glass:M([80,85],[3,3.5],250,[120,150,180],{inf:[2,3]}),cold:COLD([8,10])}},
 {id:'oolong_jade',name:'Jade oolong',native:'清香乌龙 · qīngxiāng',ox:'15–30% oxidized, light or no roast',proc:'Bruised, partly oxidized, then rolled tight into balls.',leaf:'Tightly rolled green balls that open into whole leaves',dry:['#4E6E32','ball'],liqs:['spring','pale','straw','lemon','gold'],common:['orchid','lilac','butter','fresh grass','stone fruit'],
  tips:['Early steeps run longer while the balls open; shorten once they have unfurled.','Smell the lid early: lilac and orchid fade fast.'],
  methods:{gongfu:M([95,100],[6,7],100,[50,30,35,45,60,75,90,120],{rinse:1}),western:M([90,95],[3,4],300,[180,240,300]),cold:COLD([10,12])}},
 {id:'oolong_dark',name:'Roasted & dark oolong',native:'熟香乌龙 · shúxiāng',ox:'30–70% oxidized, roasted or aged',proc:'Heavier oxidation, often charcoal roasted (tàn bèi) or aged.',leaf:'Rolled balls in brown and dark green',dry:['#4A3A22','ball'],liqs:['gold','honey','amber','orange','copper'],common:['honey','toasted grain','stone fruit','caramel','nutty'],
  tips:['A good roast stays sweet without char in the late steeps.'],
  methods:{gongfu:M([95,100],[6,7],100,[30,20,25,30,40,55,75,100],{rinse:1}),western:M([95,100],[3,4],300,[180,240,300])}},
 {id:'yancha',name:'Wuyi rock oolong',native:'岩茶 · yán chá',ox:'40–60% oxidized, charcoal roasted',proc:'Long, twisted strips, roasted over charcoal and rested for months.',leaf:'Long dark twisted strips, bulky',dry:['#3A2A1C','twist'],liqs:['honey','amber','orange','copper','brick'],common:['mineral','charcoal','cinnamon','stone fruit','orchid'],
  tips:['Fill the vessel; the leaf nearly fills it once wet.','Rock rhyme (yán yùn), a mineral finish, shows from the third infusion on.'],
  methods:{gongfu:M([98,100],[7,8],100,[5,5,7,10,15,20,30,45,60],{rinse:1}),western:M([95,100],[3,3.5],300,[60,90,150])}},
 {id:'dancong',name:'Phoenix dancong',native:'单丛 · dān cōng',ox:'Strip oolong, 30–50% oxidized',proc:'Single-bush strip oolongs from Phoenix Mountain, bred for one fragrance (xiāng).',leaf:'Long, straight, dark strips',dry:['#4B3B26','twist'],liqs:['lemon','gold','honey','amber'],common:['honey','orchid','gardenia','lychee','stone fruit'],
  tips:['Pour off fast; dancong turns bitter within seconds.','Drop the temperature a little if bitterness builds.'],
  methods:{gongfu:M([90,100],[6,7],100,[5,5,7,10,12,15,20,25,35,45],{rinse:1})}},
 {id:'black',name:'Black (hóng chá)',native:'红茶 · hóng chá',ox:'Fully oxidized',proc:'Withered, rolled and fully oxidized. Called red tea in China after its liquor.',leaf:'Twisted strips, often with golden tips; broken grades for CTC',dry:['#2F2219','twist'],liqs:['amber','orange','copper','brick','ruby','garnet'],common:['malt','cocoa','honey','dried fruit','muscatel'],
  tips:['Golden-tipped teas do better a little cooler.'],
  methods:{gongfu:M([90,95],[5,6],100,[10,10,15,20,30,45,60,90]),western:M([90,95],[2.5,3],300,[180,240])}},
 {id:'blend',name:'Breakfast, Earl Grey & blends',native:'British and flavoured blends',ox:'Fully oxidized black base',proc:'Black teas blended for strength, or flavoured (bergamot, smoke, spice).',leaf:'Broken leaf or fannings; small pieces for a fast, strong cup',dry:['#2B1E16','twist'],liqs:['orange','copper','brick','ruby'],common:['malt','citrus','honey','pine smoke','cinnamon'],
  tips:['Freshly boiled water; reboiled water tastes flat.','Add milk after pouring if you take it.'],
  methods:{western:M([95,100],[2.5,3],300,[240],{inf:[1,1]}),iced:M([95,100],[5,6],250,[300],{inf:[1,1]})}},
 {id:'sheng',name:'Raw pu’er (sheng)',native:'生普 · shēng pǔ',ox:'Raw; slowly ferments with age',proc:'Sun-dried máochá, steamed and pressed into cakes, bricks or tuo.',leaf:'Large whole leaves compressed into cakes; break along the leaf',dry:['#5E5A30','chunk'],liqs:['lemon','gold','honey','amber'],common:['honey','orchid','stone fruit','camphor','forest floor'],
  tips:['Young sheng is bitter and bright; keep early steeps short.','Watch for huí gān, the sweetness that returns in the throat.'],
  methods:{gongfu:M([90,100],[6,8],100,[8,8,10,12,15,20,25,35,50,75,120,180],{rinse:1}),glass:M([85,95],[2,3],350,[180,300,300],{inf:[3,6]})}},
 {id:'shou',name:'Ripe pu’er (shou)',native:'熟普 · shú pǔ',ox:'Ripe; wet-pile fermented (wòduī)',proc:'Accelerated fermentation in heaps for weeks, developed in 1973.',leaf:'Dark compressed leaf; loose nuggets (chá tóu) too',dry:['#2A1A12','chunk'],liqs:['garnet','chestnut','mahogany','espresso','ebony'],common:['forest floor','cocoa','leather','brown sugar','petrichor'],
  tips:['Rinse once or twice to clear pile flavour.','Forgiving: long late steeps stay smooth.'],
  methods:{gongfu:M([98,100],[7,8],100,[10,10,15,20,25,35,50,75,120],{rinse:2}),western:M([98,100],[3,4],300,[180,240,300]),simmer:M([100,100],[3,5],700,[600],{inf:[1,2]})}},
 {id:'hei',name:'Hei cha (dark tea)',native:'黑茶 · hēi chá',ox:'Post-fermented',proc:'Piled and fermented, pressed into bricks, baskets and pillars.',leaf:'Coarse, mature leaf and stems, compressed',dry:['#3B2A1A','chunk'],liqs:['copper','brick','ruby','chestnut','mahogany'],common:['petrichor','forest floor','medicinal','pine smoke','brown sugar'],
  tips:['Boiling water always.','Simmer the spent leaf at the end for one more deep cup.'],
  methods:{gongfu:M([98,100],[7,8],100,[10,15,20,30,45,60,90,120],{rinse:1}),simmer:M([100,100],[5,8],1000,[900],{inf:[1,2]})}},
 {id:'tisane',name:'Herbal tisane',native:'Not Camellia sinensis',ox:'—',proc:'Flowers, roots, grains, bark and leaves of other plants.',leaf:'Varies: flowers, needles, grains',dry:['#8A6A3A','leaf'],liqs:['lemon','gold','honey','rose','hibiscus','ruby'],common:['honey','citrus','berry','medicinal'],
  tips:['Use full-boil water and long steeps.'],
  methods:{western:M([95,100],[2,4],300,[300,420],{inf:[1,2]}),cold:COLD([8,12])}},
 {id:'other',name:'Other',native:'Anything else',ox:'Varies',proc:'Teas outside the families above.',leaf:'Varies',dry:['#5A4A30','leaf'],liqs:['straw','gold','amber','copper'],common:['honey','malt','fresh grass'],
  tips:['Start in the middle of the ranges and adjust.'],
  methods:{western:M([85,100],[2.5,3],300,[180,240]),gongfu:M([85,100],[5,6],100,[15,20,30,45,60]),cold:COLD([8,10])}}
];
const FAM = Object.fromEntries(FAMS.map(c=>[c.id,c]));

// Tea types: [name, also known as, family, origin, extras]
// extras: t = water range for hot methods; only = keep just these family methods; m = per-method overrides (false removes);
// add = extra methods; leaf, char, liqs, dry = descriptive overrides.
const KYU_STEPS = ['Boil the water, then pour it into the cups to warm them and cool it.','Add the leaf to the pot and pour the water from the cups onto it.','Leave the pot still for the first infusion.','Pour into the cups in rotation, a little at a time, so every cup is even. Shake out the last drops.','Later infusions: hotter water, only a few seconds.'];
const LIB_RAW = [
 // Chinese & Korean green
 ['Xī Hú Lóng Jǐng','Dragonwell','green','West Lake, Hangzhou, Zhejiang, China',{t:[75,85],leaf:'Flat, sword-shaped pressed leaves',char:'Toasted chestnut, snap pea, soft and sweet'}],
 ['Bì Luó Chūn','Green Snail Spring','green','Dongting, Suzhou, Jiangsu, China',{t:[70,80],leaf:'Tiny downy spirals',char:'Fruity, floral and very fresh',liqs:['celadon','spring','jade']}],
 ['Huáng Shān Máo Fēng','Yellow Mountain Fur Peak','green','Huangshan, Anhui, China',{leaf:'Downy bud and leaf, like a sparrow’s tongue',char:'Orchid, sweet grass'}],
 ['Tài Píng Hóu Kuí','Monkey King','green','Huangshan, Anhui, China',{t:[80,85],leaf:'Very long, flat, pressed leaves',char:'Orchid, mineral, sweet',m:{glass:{g:[3,4]}}}],
 ['Lù Ān Guā Piàn','Melon Seed','green','Lu’an, Anhui, China',{t:[80,85],leaf:'Single leaves, no buds, rolled like seeds',char:'Roasted, savoury, full'}],
 ['Ān Jí Bái Chá','Anji White','green','Anji, Huzhou, Zhejiang, China',{t:[75,80],leaf:'Pale, narrow phoenix-feather leaves',char:'Brothy umami, very low bitterness',liqs:['celadon','spring','ivory']}],
 ['Xìn Yáng Máo Jiān','','green','Xinyang, Henan, China',{leaf:'Thin straight needles',char:'Grassy, bright, clean'}],
 ['Ēn Shī Yù Lù','Jade Dew','green','Enshi, Hubei, China',{t:[75,80],leaf:'Steamed needles, Japanese style',char:'Marine, sweet, fresh'}],
 ['Zhú Yè Qīng','Bamboo Leaf','green','Emei Shan, Sichuan, China',{leaf:'Flat buds',char:'Soft, sweet, bamboo-fresh'}],
 ['Gunpowder','Zhū Chá','green','Shaoxing, Zhejiang, China',{t:[80,85],leaf:'Tightly rolled pellets',char:'Smoky, robust',dry:['#4E5E33','ball'],liqs:['straw','lemon','olive']}],
 ['Sejak','Korean early-harvest green','green','Hadong, South Gyeongsang, South Korea',{t:[70,80],char:'Nutty, savoury, gentle'}],
 ['Ujeon','Korean first-picking green','green','Hadong, South Gyeongsang, South Korea',{t:[65,75],char:'Delicate, sweet, buttery'}],
 // Japanese green
 ['Sencha','','jpgreen','Shizuoka, Japan',{char:'Grassy, marine, bittersweet'}],
 ['Fukamushi Sencha','Deep-steamed sencha','jpgreen','Makinohara, Shizuoka, Japan',{m:{kyusu:{sched:[45,10,30,60]}},leaf:'Short broken needles and powder',char:'Thick, dark green, sweet, low astringency',liqs:['emerald','matcha','olive']}],
 ['Shincha','First flush','jpgreen','Kagoshima, Japan',{t:[65,75],char:'Vivid, sweet, very fresh'}],
 ['Gyokuro','Jade Dew','jpgreen','Hoshino, Yame, Fukuoka, Japan',{m:{kyusu:{t:[50,60],g:[6,8],ml:60,sched:[120,30,60],vessels:['houhin','shibo','kyusu']}},leaf:'Shaded 3 weeks; glossy deep-green needles',char:'Intense umami, broth, sweet',liqs:['celadon','spring','jade']}],
 ['Kabusecha','Shaded sencha','jpgreen','Ise, Mie, Japan',{m:{kyusu:{t:[60,70],g:[5,6],ml:120,sched:[75,15,40]}},char:'Between sencha and gyokuro: sweet and brothy'}],
 ['Kamairicha','Pan-fired Japanese green','jpgreen','Ureshino, Saga, Japan',{only:['kyusu','cold'],m:{kyusu:{t:[80,90],sched:[60,30,60]}},leaf:'Comma-shaped, pan-fired',char:'Toasty and clean, closer to Chinese green',liqs:['pale','straw','spring']}],
 ['Tamaryokucha','Guricha','jpgreen','Ureshino, Saga, Japan',{m:{kyusu:{sched:[60,20,40]}},leaf:'Curled, comma-shaped',char:'Smooth, citrusy, low bitterness'}],
 ['Matcha','','jpgreen','Uji, Kyoto, Japan',{only:[],add:{whisked:M([75,80],[1.5,2],70,[20],{inf:[1,1]}),koicha:M([75,80],[3.5,4],35,[30],{inf:[1,1]})},leaf:'Stone-ground shaded tencha powder',char:'Creamy umami, vegetal, sweet finish',dry:['#6E9A2E','powder'],liqs:['matcha','emerald']}],
 ['Hōjicha','Roasted green','jpgreen','Kyoto, Japan',{only:['kyusu','cold'],m:{kyusu:{t:[95,100],g:[4,5],ml:200,sched:[30,30,60]}},add:{western:M([95,100],[3,4],300,[60,120])},leaf:'Roasted brown leaves and stems',char:'Toasty, caramel, almost no caffeine',dry:['#7A4B26','leaf'],liqs:['honey','amber','orange','copper']}],
 ['Genmaicha','With toasted rice','jpgreen','Shizuoka, Japan',{only:['kyusu','cold'],m:{kyusu:{t:[85,95],sched:[30,30,60]}},char:'Toasted rice, popcorn, grassy',liqs:['straw','lemon','spring']}],
 ['Kukicha','Stem tea','jpgreen','Kyoto, Japan',{m:{kyusu:{t:[70,80],sched:[45,20,40]}},leaf:'Pale stems and twigs',char:'Sweet, creamy, light',liqs:['pale','straw','spring']}],
 ['Bancha','Late-harvest green','jpgreen','Shizuoka, Japan',{only:['kyusu','cold'],m:{kyusu:{t:[90,100],sched:[30,30,60]}},leaf:'Large, mature leaves',char:'Light, woody, everyday',liqs:['straw','lemon','olive']}],
 // White
 ['Bái Háo Yín Zhēn','Silver Needle','white','Fuding, Fujian, China',{t:[80,90],m:{gongfu:{sched:[45,30,40,50,60,90,120]}},add:{glass:M([80,85],[3,4],250,[180,180,240],{inf:[2,3]})},leaf:'Plump downy buds only',char:'Honey, melon, hay, very soft'}],
 ['Bái Mǔ Dān','White Peony','white','Zhenghe, Nanping, Fujian, China',{char:'Honey, hay, light florals'}],
 ['Shòu Méi','Longevity Eyebrow','white','Fuding, Fujian, China',{t:[90,100],leaf:'Larger, later leaves',char:'Fuller, woody, dried fruit',liqs:['straw','lemon','gold']}],
 ['Gòng Méi','Tribute Eyebrow','white','Jianyang, Nanping, Fujian, China',{t:[90,95],char:'Fruity, sweet'}],
 ['Yuè Guāng Bái','Moonlight White','white','Jinggu, Pu’er, Yunnan, China',{leaf:'Two-tone black and silver leaves',char:'Stone fruit, honey, a little wild',liqs:['straw','lemon','gold']}],
 ['Aged white cake','Lǎo bái chá','white','Fuding, Fujian, China',{t:[95,100],add:{simmer:M([95,100],[3,5],500,[300,600],{inf:[1,2]})},char:'Dates, medicinal herbs, honeyed wood',dry:['#7D6A4A','chunk'],liqs:['gold','honey','amber']}],
 // Yellow
 ['Jūn Shān Yín Zhēn','Junshan Silver Needle','yellow','Junshan Island, Yueyang, Hunan, China',{char:'Sweet corn, soft and mellow'}],
 ['Huò Shān Huáng Yá','','yellow','Huoshan, Anhui, China',{char:'Toasted corn, chestnut'}],
 ['Méng Dǐng Huáng Yá','','yellow','Mengding Shan, Ya’an, Sichuan, China',{char:'Sweet, nutty, gentle'}],
 // Scented
 ['Mò Lì Lóng Zhū','Jasmine Pearls','scented','Fuding, Fujian, China',{m:{gongfu:{sched:[45,30,40,60,90]}},leaf:'Hand-rolled green pearls',char:'Fresh jasmine over sweet green tea'}],
 ['Mò Lì Yín Zhēn','Jasmine Silver Needle','scented','Fuding, Fujian, China',{dry:['#B8B39A','bud'],char:'Jasmine and honey'}],
 ['Guì Huā Oolong','Osmanthus oolong','scented','Anxi, Quanzhou, Fujian, China',{t:[90,95],char:'Apricot-like osmanthus over oolong',liqs:['lemon','gold','honey']}],
 // Jade oolong
 ['Ālǐshān Gāoshān','Alishan high mountain','oolong_jade','Alishan, Chiayi, Taiwan',{char:'Creamy, floral, sweet'}],
 ['Lí Shān','Lishan','oolong_jade','Lishan, Taichung, Taiwan',{char:'Pear, lilac, thick and cooling'}],
 ['Dà Yǔ Lǐng','Dayuling','oolong_jade','Dayuling, Taichung, Taiwan',{char:'Pine, orchid, very long finish'}],
 ['Shān Lín Xī','','oolong_jade','Shan Lin Xi, Nantou, Taiwan',{char:'Bamboo forest, butter, florals'}],
 ['Wénshān Bāozhǒng','Pouchong','oolong_jade','Pinglin, New Taipei, Taiwan',{t:[85,90],m:{gongfu:{sched:[40,30,40,50,70,90]}},leaf:'Twisted open strips, barely oxidized',char:'Lily, gardenia, light and green',dry:['#55703A','twist'],liqs:['celadon','spring','pale','straw']}],
 ['Jīn Xuān','Milk oolong','oolong_jade','Mingjian, Nantou, Taiwan',{t:[90,95],char:'Naturally creamy, buttery'}],
 ['Tiě Guān Yīn (modern)','Iron Goddess, green style','oolong_jade','Anxi, Quanzhou, Fujian, China',{char:'Orchid, lilac, sweet cream'}],
 ['Huáng Jīn Guì','Golden Osmanthus','oolong_jade','Anxi, Quanzhou, Fujian, China',{char:'Osmanthus, honeysuckle'}],
 // Dark oolong
 ['Dòng Dǐng','Tung Ting','oolong_dark','Lugu, Nantou, Taiwan',{char:'Roasted nuts, honey, brown sugar',liqs:['lemon','gold','honey','amber']}],
 ['Tiě Guān Yīn (traditional)','Roasted Iron Goddess','oolong_dark','Anxi, Quanzhou, Fujian, China',{char:'Toasted grain, ripe fruit, orchid underneath'}],
 ['Dōng Fāng Měi Rén','Oriental Beauty','oolong_dark','Beipu, Hsinchu, Taiwan',{t:[85,90],add:{cold:COLD([10,12])},leaf:'Leafhopper-bitten, five-coloured leaves; open, not rolled',char:'Honey, muscatel, ripe peach',dry:['#7A5A2E','twist'],liqs:['honey','amber','orange']}],
 ['Hóng Shuǐ Oolong','Red water oolong','oolong_dark','Lugu, Nantou, Taiwan',{char:'Plum, roast, honeyed'}],
 ['GABA Oolong','','oolong_dark','Taiwan',{t:[90,95],char:'Fruity-sour, roasted, mellow'}],
 ['Aged oolong','Lǎo chá','oolong_dark','Taiwan',{t:[100,100],char:'Plum, wood, sour cherry, smooth',liqs:['amber','orange','copper','brick']}],
 // Yancha
 ['Dà Hóng Páo','Big Red Robe','yancha','Wuyi Shan, Nanping, Fujian, China',{char:'Roast, dark fruit, mineral'}],
 ['Ròu Guì','Cinnamon','yancha','Wuyi Shan, Nanping, Fujian, China',{char:'Cinnamon bark, spice, dark cherry'}],
 ['Shuǐ Xiān (Lǎo Cóng)','Old-bush Narcissus','yancha','Wuyi Shan, Nanping, Fujian, China',{char:'Woody, moss, deep and smooth'}],
 ['Tiě Luó Hàn','Iron Arhat','yancha','Wuyi Shan, Nanping, Fujian, China',{char:'Roast, mineral, herbal'}],
 ['Bái Jī Guān','White Cockscomb','yancha','Wuyi Shan, Nanping, Fujian, China',{t:[95,98],char:'Light roast, apricot, bright',liqs:['lemon','gold','honey']}],
 ['Qí Lán','Rare Orchid','yancha','Wuyi Shan, Nanping, Fujian, China',{char:'Orchid, sweet roast'}],
 ['Shuǐ Jīn Guī','Golden Water Turtle','yancha','Wuyi Shan, Nanping, Fujian, China',{char:'Floral, mineral, smooth'}],
 // Dancong
 ['Mì Lán Xiāng','Honey Orchid','dancong','Fenghuang Shan, Chaozhou, Guangdong, China',{char:'Honey, lychee, orchid'}],
 ['Yā Shǐ Xiāng','Duck Shit Aroma','dancong','Wudong, Chaozhou, Guangdong, China',{char:'Almond blossom, gardenia, citrus'}],
 ['Huáng Zhī Xiāng','Gardenia / Yellow Sprig','dancong','Fenghuang Shan, Chaozhou, Guangdong, China',{char:'Gardenia, peach'}],
 ['Bā Xiān','Eight Immortals','dancong','Raoping, Chaozhou, Guangdong, China',{char:'Floral, bright, sharp'}],
 ['Zhī Lán Xiāng','Orchid','dancong','Fenghuang Shan, Chaozhou, Guangdong, China',{char:'Orchid, cream'}],
 ['Sòng Zhǒng','Song cultivar','dancong','Wudong, Chaozhou, Guangdong, China',{char:'Complex, honeyed, very long'}],
 // Black
 ['Qí Mén Hóng Chá','Keemun','black','Qimen, Huangshan, Anhui, China',{char:'Cocoa, orchid, a hint of smoke'}],
 ['Diān Hóng','Yunnan Gold','black','Fengqing, Lincang, Yunnan, China',{t:[85,90],leaf:'Fat golden buds',char:'Malt, sweet potato, cocoa',liqs:['honey','amber','orange','copper']}],
 ['Jīn Jùn Méi','Golden Eyebrow','black','Tongmu, Wuyi Shan, Fujian, China',{t:[85,90],leaf:'Tiny golden-black buds',char:'Honey, longan, cocoa',liqs:['gold','honey','amber']}],
 ['Zhèng Shān Xiǎo Zhǒng','Unsmoked Lapsang','black','Tongmu, Wuyi Shan, Fujian, China',{char:'Longan, honey, gentle pine'}],
 ['Lapsang Souchong','Pine-smoked','black','Tongmu, Wuyi Shan, Fujian, China',{only:['western','gongfu'],char:'Pine smoke, resin, dried fruit',liqs:['copper','brick','ruby']}],
 ['Tǎn Yáng Gōng Fū','','black','Fu’an, Ningde, Fujian, China',{char:'Chocolate, longan'}],
 ['Hóng Yù (Ruby 18)','Sun Moon Lake','black','Yuchi, Nantou, Taiwan',{char:'Cinnamon, mint, wild plum'}],
 ['Darjeeling First Flush','','black','Darjeeling, West Bengal, India',{t:[85,90],m:{western:{sched:[180,240]}},leaf:'Green-brown leaf, lightly oxidized for a black tea',char:'Floral, green, astringent sparkle',liqs:['lemon','gold','straw']}],
 ['Darjeeling Second Flush','Muscatel','black','Darjeeling, West Bengal, India',{t:[90,95],m:{western:{sched:[180,240]}},char:'Muscat grape, ripe fruit',liqs:['gold','honey','amber']}],
 ['Assam','Second flush Assam','black','Assam, India',{only:['western'],m:{western:{t:[98,100],g:[3,3.5],sched:[240,300]}},add:{iced:M([98,100],[5,6],250,[300],{inf:[1,1]})},leaf:'Small dark leaf with golden tips',char:'Bold malt; takes milk'}],
 ['Nilgiri','','black','Nilgiri, Tamil Nadu, India',{only:['western'],add:{iced:M([95,100],[5,6],250,[240],{inf:[1,1]})},char:'Bright, brisk, fruity; clear when iced'}],
 ['Ceylon (Nuwara Eliya)','High-grown Ceylon','black','Nuwara Eliya, Central Province, Sri Lanka',{only:['western'],m:{western:{t:[90,95]}},add:{iced:M([95,100],[5,6],250,[240],{inf:[1,1]})},char:'Bright, citrusy, brisk',liqs:['gold','honey','amber']}],
 ['Ceylon (Uva)','','black','Uva, Sri Lanka',{only:['western'],m:{western:{t:[95,100],sched:[240]}},char:'Wintergreen, brisk, strong'}],
 ['Kenyan black','','black','Kericho, Kenya',{only:['western'],m:{western:{t:[98,100],sched:[180,240]}},char:'Strong, coppery, bright'}],
 ['Ilam black','Nepal','black','Ilam, Koshi, Nepal',{t:[85,90],char:'Floral, honeyed, Darjeeling-like',liqs:['gold','honey','amber']}],
 ['Wakōcha','Japanese black','black','Kagoshima, Japan',{t:[90,95],char:'Soft, honeyed, low astringency',liqs:['honey','amber','orange']}],
 // Breakfast, Earl Grey & blends
 ['English Breakfast','','blend','',{m:{western:{sched:[240,300]}},char:'Malty, brisk; Assam, Ceylon and Kenyan base'}],
 ['Irish Breakfast','','blend','',{m:{western:{g:[3,3.5],sched:[240,300]}},char:'Strong and malty, Assam-heavy'}],
 ['Scottish Breakfast','','blend','',{m:{western:{g:[3,3.5],sched:[240,300]}},char:'The strongest breakfast blend'}],
 ['Earl Grey','','blend','',{m:{western:{sched:[180,240]}},add:{cold:COLD([8,10])},char:'Black tea with bergamot oil',liqs:['amber','orange','copper']}],
 ['Lady Grey','','blend','',{m:{western:{sched:[180,240]}},add:{cold:COLD([8,10])},char:'Earl Grey with orange and lemon peel',liqs:['amber','orange','copper']}],
 ['Russian Caravan','','blend','',{char:'Keemun, lapsang and oolong: gently smoky'}],
 ['Prince of Wales','','blend','',{m:{western:{sched:[180,240]}},char:'Keemun-based, light and smooth'}],
 ['Afternoon blend','','blend','',{m:{western:{sched:[180,240]}},char:'Lighter, Ceylon and Darjeeling based'}],
 ['Masala chai','Spiced milk tea','blend','',{only:[],add:{simmer:M([100,100],[6,8],400,[300],{inf:[1,1]})},char:'CTC Assam simmered with milk, sugar and spices',dry:['#2B1E16','ball'],liqs:['milky']}],
 // Raw pu'er
 ['Yìwǔ','','sheng','Yiwu, Xishuangbanna, Yunnan, China',{char:'Soft, sweet, thick, gentle bitterness'}],
 ['Lǎo Bān Zhāng','','sheng','Bulang Shan, Xishuangbanna, Yunnan, China',{char:'Powerful, bitter, huge huí gān'}],
 ['Bīng Dǎo','','sheng','Bingdao, Lincang, Yunnan, China',{char:'Rock sugar sweetness, floral, cooling'}],
 ['Jǐng Mài','','sheng','Jingmai, Pu’er, Yunnan, China',{char:'Orchid, honey, lively'}],
 ['Yì Bāng','','sheng','Yibang, Xishuangbanna, Yunnan, China',{char:'Sweet, floral, small-leaf'}],
 ['Menghai 7542','Factory recipe','sheng','Menghai, Xishuangbanna, Yunnan, China',{char:'The benchmark blend; ages into dried fruit and wood'}],
 ['Aged sheng (15y+)','','sheng','Yunnan, China',{t:[98,100],char:'Camphor, wood, dried fruit, smooth',liqs:['orange','copper','brick','ruby']}],
 ['Yě Shēng','Wild tree','sheng','Yunnan, China',{t:[85,95],char:'Wild, fruity, cooling'}],
 // Ripe pu'er
 ['Menghai 7572','','shou','Menghai, Xishuangbanna, Yunnan, China',{char:'The benchmark ripe blend: earthy, sweet'}],
 ['Gōng Tíng','Palace grade','shou','Yunnan, China',{leaf:'Fine buds only',char:'Smooth, sweet, light-bodied for shou'}],
 ['Xiaguan shou tuocha','','shou','Xiaguan, Dali, Yunnan, China',{char:'Strong, earthy, robust'}],
 ['Gǔ Shù shou','Old-tree ripe','shou','Lincang, Yunnan, China',{char:'Thick, sweet, clean fermentation'}],
 ['Lǎo Chá Tóu','Tea nuggets','shou','Menghai, Xishuangbanna, Yunnan, China',{m:{gongfu:{sched:[15,15,20,25,35,50,75,120,180,300]}},leaf:'Naturally clumped nuggets',char:'Sticky rice, dates, syrupy'}],
 // Hei cha
 ['Liù Bǎo','','hei','Wuzhou, Guangxi, China',{add:{western:M([98,100],[3,4],300,[180,240,300])},char:'Areca nut, wood, cooling'}],
 ['Fú Zhuān','Fu brick, golden flower','hei','Anhua, Yiyang, Hunan, China',{char:'Golden flowers: sweet, fungal, herbal'}],
 ['Tiān Jiān','','hei','Anhua, Yiyang, Hunan, China',{char:'Pine smoke, sweet, woody'}],
 ['Qiān Liǎng','Thousand-tael','hei','Anhua, Yiyang, Hunan, China',{char:'Smoky, woody, ages deeply'}],
 ['Liù Ān Lán Chá','Liu An basket','hei','Qimen, Huangshan, Anhui, China',{char:'Bamboo, cooling, herbal'}],
 ['Qīng Zhuān','Green brick','hei','Xianning, Hubei, China',{char:'Woody, earthy'}],
 // Tisane
 ['Hángbái Jú','Chrysanthemum','tisane','Tongxiang, Jiaxing, Zhejiang, China',{only:[],add:{glass:M([90,95],[2,3],300,[300,300],{inf:[2,3]})},char:'Honeyed, floral, cooling',liqs:['ivory','pale','straw','lemon']}],
 ['Rooibos','Red bush','tisane','Cederberg, Western Cape, South Africa',{m:{western:{sched:[300,420]}},char:'Vanilla, honey, wood; no caffeine',liqs:['orange','copper','brick']}],
 ['Honeybush','','tisane','Western Cape, South Africa',{char:'Honey, apricot',liqs:['honey','amber','orange']}],
 ['Hibiscus','Roselle','tisane','',{char:'Tart cranberry, bright',liqs:['rose','hibiscus','ruby']}],
 ['Mugicha','Roasted barley','tisane','Japan',{only:['cold'],add:{simmer:M([100,100],[8,10],1000,[600],{inf:[1,1]})},char:'Toasted grain, coffee-like',liqs:['amber','orange','copper']}],
 ['Chamomile','','tisane','',{only:['western'],char:'Apple, honey, calming',liqs:['ivory','pale','straw','lemon']}],
 ['Peppermint','','tisane','',{only:['western'],char:'Cooling mint',liqs:['straw','lemon','gold']}],
 ['Yerba mate','','tisane','Misiones, Argentina',{only:['western','cold'],m:{western:{t:[70,80],sched:[300]}},char:'Grassy, smoky, caffeinated',liqs:['olive','straw','lemon']}]
];
const LIB = LIB_RAW.map(([name,aka,fam,origin,x])=>({name,aka,fam,origin,x:x||{}}));

// Tea-growing places. Every type origin above is included, plus regions, estates and countries.
const LOCS = [...new Set([...LIB.map(t=>t.origin).filter(Boolean),
 'China','Japan','Taiwan','India','Sri Lanka','Nepal','South Korea','Vietnam','Thailand','Laos','Myanmar','Indonesia','Malaysia','Kenya','Malawi','Rwanda','Tanzania','Uganda','Georgia','Turkey','Iran','Argentina','Brazil','South Africa','Egypt','United States','United Kingdom','Portugal','New Zealand','Australia','Colombia',
 'Fujian, China','Yunnan, China','Zhejiang, China','Anhui, China','Guangdong, China','Hunan, China','Sichuan, China','Guangxi, China','Jiangsu, China','Henan, China','Hubei, China','Guizhou, China','Jiangxi, China','Shaanxi, China','Shandong, China',
 'Fuding, Fujian, China','Zhenghe, Nanping, Fujian, China','Anxi, Quanzhou, Fujian, China','Wuyi Shan, Nanping, Fujian, China','Tongmu, Wuyi Shan, Fujian, China','Zhangping, Fujian, China','Pinghe, Fujian, China',
 'Xishuangbanna, Yunnan, China','Lincang, Yunnan, China','Pu’er, Yunnan, China','Menghai, Xishuangbanna, Yunnan, China','Nannuo Shan, Xishuangbanna, Yunnan, China','Mengku, Lincang, Yunnan, China','Bada Shan, Xishuangbanna, Yunnan, China','Jingmai, Pu’er, Yunnan, China','Gaoshan Zhai, Xishuangbanna, Yunnan, China','Lao Man’e, Xishuangbanna, Yunnan, China','Mansa, Yiwu, Xishuangbanna, Yunnan, China','Mangfei, Lincang, Yunnan, China','Dali, Yunnan, China','Baoshan, Yunnan, China','Simao, Pu’er, Yunnan, China',
 'Hangzhou, Zhejiang, China','Longwu, Hangzhou, Zhejiang, China','Meijiawu, Hangzhou, Zhejiang, China','Shifeng, Hangzhou, Zhejiang, China','Kaihua, Quzhou, Zhejiang, China','Yingde, Guangdong, China','Chaozhou, Guangdong, China','Wudong, Chaozhou, Guangdong, China','Emei Shan, Sichuan, China','Ya’an, Sichuan, China','Duyun, Guizhou, China','Meitan, Guizhou, China','Lu Shan, Jiangxi, China','Wuyuan, Jiangxi, China','Laoshan, Qingdao, Shandong, China','Hanzhong, Shaanxi, China',
 'Shizuoka, Japan','Kagoshima, Japan','Kyoto, Japan','Uji, Kyoto, Japan','Wazuka, Kyoto, Japan','Nara, Japan','Tsukigase, Nara, Japan','Mie, Japan','Ise, Mie, Japan','Fukuoka, Japan','Yame, Fukuoka, Japan','Saga, Japan','Miyazaki, Japan','Gokase, Miyazaki, Japan','Kumamoto, Japan','Nagasaki, Japan','Saitama, Japan','Sayama, Saitama, Japan','Shiga, Japan','Aichi, Japan','Nishio, Aichi, Japan',
 'Chiran, Kagoshima, Japan','Kirishima, Kagoshima, Japan','Tanegashima, Kagoshima, Japan','Makinohara, Shizuoka, Japan','Kawane, Shizuoka, Japan','Honyama, Shizuoka, Japan','Kakegawa, Shizuoka, Japan','Tenryu, Shizuoka, Japan','Ureshino, Saga, Japan',
 'Nantou, Taiwan','Chiayi, Taiwan','Taichung, Taiwan','Hsinchu, Taiwan','New Taipei, Taiwan','Taipei, Taiwan','Hualien, Taiwan','Taitung, Taiwan','Yilan, Taiwan','Pinglin, New Taipei, Taiwan','Muzha, Taipei, Taiwan','Fushoushan, Lishan, Taichung, Taiwan','Meishan, Chiayi, Taiwan','Lugu, Nantou, Taiwan','Yuchi, Nantou, Taiwan','Mingjian, Nantou, Taiwan','Beipu, Hsinchu, Taiwan','Emei, Hsinchu, Taiwan','Luye, Taitung, Taiwan','Ruisui, Hualien, Taiwan',
 'Darjeeling, West Bengal, India','Assam, India','Nilgiri, Tamil Nadu, India','Sikkim, India','Temi, Sikkim, India','Kangra, Himachal Pradesh, India','Munnar, Kerala, India','Dooars, West Bengal, India','Castleton Estate, Darjeeling, India','Makaibari Estate, Darjeeling, India','Margaret’s Hope Estate, Darjeeling, India','Goomtee Estate, Darjeeling, India','Glenburn Estate, Darjeeling, India','Jungpana Estate, Darjeeling, India','Puttabong Estate, Darjeeling, India','Thurbo Estate, Darjeeling, India','Giddapahar Estate, Darjeeling, India','Seeyok Estate, Darjeeling, India','Halmari Estate, Assam, India','Mangalam Estate, Assam, India',
 'Nuwara Eliya, Central Province, Sri Lanka','Dimbula, Sri Lanka','Uva, Sri Lanka','Kandy, Sri Lanka','Ruhuna, Sri Lanka','Ilam, Koshi, Nepal','Dhankuta, Koshi, Nepal','Hadong, South Gyeongsang, South Korea','Boseong, South Jeolla, South Korea','Jeju, South Korea',
 'Ha Giang, Vietnam','Thai Nguyen, Vietnam','Lam Dong, Vietnam','Doi Mae Salong, Chiang Rai, Thailand','Kericho, Kenya','Nandi Hills, Kenya','Thyolo, Malawi','Guria, Georgia','Rize, Turkey','Gilan, Iran','Misiones, Argentina','Hawaii, United States','Cornwall, United Kingdom','São Miguel, Azores, Portugal','Waikato, New Zealand','Cameron Highlands, Pahang, Malaysia','West Java, Indonesia','Cederberg, Western Cape, South Africa','Western Cape, South Africa'
])];

// Tea brands and producers.
const BRANDS = ["Twinings", "Harney & Sons", "Mariage Frères", "Kusmi Tea", "TWG Tea", "Dammann Frères", "Fortnum & Mason", "Whittard of Chelsea", "Betjeman & Barton", "PG Tips", "Yorkshire Tea", "Taylors of Harrogate", "Tetley", "Typhoo", "Clipper", "Pukka", "Ahmad Tea", "Dilmah", "Lipton", "Bigelow", "Tazo", "Teavana", "Celestial Seasonings", "Stash Tea", "Numi", "Yogi Tea", "Tea Forté", "Republic of Tea", "Rishi Tea", "Steven Smith Teamaker", "Art of Tea", "Bellocq", "DavidsTea", "T2", "Le Palais des Thés", "Ronnefeldt", "Teekanne", "Lupicia", "Ito En", "Ippodo", "Marukyu Koyamaen", "Itohkyuemon", "Fukujuen", "Tsujiri", "Yamamotoyama", "Hibiki-an", "Yunomi", "Obubu Tea", "Sazen Tea", "O-Cha.com", "Den’s Tea", "Kettl", "Sugimoto Tea", "Matcha.com", "Encha", "Mei Leaf", "White2Tea", "Yunnan Sourcing", "Crimson Lotus Tea", "Bitterleaf Teas", "Farmerleaf", "Tea Urchin", "Wuyi Origin", "Eco-Cha", "Taiwan Tea Crafts", "Floating Leaves Tea", "Seven Cups", "Verdant Tea", "Song Tea & Ceramics", "In Pursuit of Tea", "Postcard Teas", "JING Tea", "Teasenz", "Teavivre", "Tealyra", "Adagio Teas", "Upton Tea Imports", "Camellia Sinensis", "Red Blossom Tea Company", "Tea Habitat", "Wang Family Tea", "Menghai Tea Factory (Dayi)", "Xiaguan Tea Factory", "Chen Sheng Hao", "Yang Qing Hao", "Lao Tong Zhi (Haiwan)", "Fuding Pin Pin Xiang", "Glenburn Tea", "Makaibari", "Jun Chiyabari", "Halmari", "Satemwa", "Tregothnan", "Plum Deluxe", "Paper & Tea", "Té Company", "Hojo Tea", "Lin’s Ceramics", "Tea Drunk", "Global Tea Hut", "Chawang Shop", "Nio Teas", "Path of Cha", "Bewley's", "Barry's Tea", "Lyons", "Brooke Bond", "Red Rose", "Salada", "Luzianne", "Good Earth", "Traditional Medicinals", "Choice Organics", "Two Leaves and a Bud", "Long Island Iced Tea Co.", "Mighty Leaf", "Zhena's", "Tealeaves", "Sloane Tea", "Rare Tea Company", "Jenier World of Teas", "Canton Tea Co", "Lalani & Co", "Bird & Blend", "Teapigs", "Pekoe Tea", "Comins Tea", "Hampstead Tea", "Brew Tea Co", "Newby Teas", "Hediard", "Fauchon", "George Cannon", "Le Thé des Écrivains", "Compagnie Coloniale", "Nina's Paris", "Cha Yuan", "Paul Schrader", "TeaGschwendner", "OnnoBehrends", "Meßmer", "Alveus", "Basilur", "Mlesna", "Akbar", "Tata Tea", "Wagh Bakri", "Society Tea", "Girnar", "Goodricke", "Golden Tips", "Teabox", "Vahdam", "Udyan Tea", "Darjeeling Tea Boutique", "Thunderbolt Tea", "Te-A-Me", "Nakamura Tokichi", "Kanbayashi Shunsho", "Uji no Tsuyu", "Tsuen Tea", "Maiko Tea", "Ocharaka", "Mizuba Tea Co", "Naoki Matcha", "Tenfu Tea", "China National Tea (Zhongcha)", "Zhang Yiyuan", "Wu Yu Tai", "Taetea (Dayi)", "Haiwan", "Mengku Rongshi", "Bai Sha Xi", "Pinpinxiang", "Ten Ren", "Lin Mao Sen", "Wang De Chuan", "Wistaria Tea House", "Shang Tea", "Chun Shui Tang", "Old Ways Tea", "Tea Masters (Stéphane Erler)", "Taiwan Sourcing", "Teaful", "What-Cha", "Liquid Proust Teas", "Puerh.uk", "King Tea Mall", "Yunnan Craft", "Fullchea", "Teanamu", "Essence of Tea", "Moychay", "Tea Side", "Spirit Tea", "Stone Leaf Teahouse", "Tea Hong", "Teance", "Imperial Tea Court", "Silk Road Teas", "Dobra Tea", "Samovar", "Chado Tea Room", "Leaves and Flowers", "Cultivate Tea", "Lantern Tea", "Kitty's Tea", "Townshend's Tea", "Tea Embassy", "Murchie's", "Sloane Fine Tea", "Arbor Teas", "Simpson & Vail", "SerendipiTea", "Grace Tea Company", "Ceylon Tea Trails", "Halpe Tea", "Lumbini Tea Valley", "Kericho Gold", "Pique", "Cuzen Matcha", "Jade Leaf Matcha", "Matchaful", "Golden Moon Tea", "Yum Cha Tea Company", "Valley Brook Tea"];

// Teaware: [id, name, drawing, material, default ml]
const VTYPES = [
 ['gaiwan','Gaiwan','gaiwan','porcelain',100],['yixing','Yixing pot','teapot','clay',120],['chaozhou','Chaozhou pot','teapot','clay',90],['jianshui','Jianshui pot','teapot','clay',130],
 ['porcelain','Porcelain teapot','bigpot','porcelain',450],['glass','Glass teapot','glass','glass',500],['kyusu','Kyusu','kyusu','clay',250],['houhin','Houhin','houhin','ceramic',90],
 ['shibo','Shiboridashi','shibo','ceramic',100],['mug','Mug & infuser','mug','ceramic',350],['tumbler','Grandpa glass','tumbler','glass',400],['chawan','Chawan','chawan','ceramic',80],['jar','Cold-brew jar','jar','glass',1000],['saucepan','Saucepan','saucepan','ceramic',1000]
].map(([id,name,icon,mat,ml])=>({id,name,icon,mat,ml}));
const VT = Object.fromEntries(VTYPES.map(v=>[v.id,v]));

const AXES = [['aroma','Aroma','fragrance, cup & lid'],['sweet','Sweetness',''],['body','Body','thin → syrupy'],['bite','Bite','bitter, astringent'],['finish','Finish','huí gān, length'],['qi','Chá qì','felt energy']];
const FLAVORS = [
 ['Floral',['orchid','osmanthus','jasmine','gardenia','lilac','rose']],
 ['Fruit',['stone fruit','lychee','citrus','muscatel','dried fruit','berry']],
 ['Sweet',['honey','caramel','malt','brown sugar','cane']],
 ['Vegetal',['fresh grass','seaweed','snap pea','chestnut','butter','umami']],
 ['Roast',['toasted grain','charcoal','cocoa','coffee','nutty']],
 ['Earth & wood',['mineral','forest floor','camphor','leather','cedar','pine smoke','petrichor']],
 ['Spice',['cinnamon','pepper','medicinal']]
];
const TEMP_MODES = [
 ['dial','Dial','Drag around a kettle-style dial with the recommended arc marked.'],
 ['steps','Steps','Start at the recommendation and nudge ±1° or ±5°.'],
 ['scale','Scale','Tap a temperature from 0 to 100°C in 5° steps.'],
 ['type','Type','Type the exact number.']
];
const DEFAULT_SETTINGS = {tempMode:'dial',unit:'C',customTypes:[],vessels:[
 {id:'w1',type:'gaiwan',name:'Gaiwan',ml:100},{id:'w2',type:'kyusu',name:'Kyusu',ml:250},{id:'w3',type:'porcelain',name:'Porcelain teapot',ml:450},{id:'w4',type:'glass',name:'Glass teapot',ml:500},{id:'w5',type:'mug',name:'Mug & infuser',ml:350}]};
