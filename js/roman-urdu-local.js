(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduRomanLocal = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Converts Urdu written in English letters ("mera naam") to Urdu script
    // ("میرا نام") entirely on the device. Common words come from a word list
    // so their spelling is right; anything else is spelled out by phonetic
    // rules. It is intentionally simpler than an online service: it gives one
    // answer per word, and people can undo a conversion with Backspace.

    // Word list: Roman spellings (including common variants) to Urdu.
    var WORDS = {};
    function add(urdu, romans) { romans.split(' ').forEach(function (roman) { if (roman) WORDS[roman] = urdu; }); }

    // Pronouns, postpositions and everyday function words.
    add('میں', 'main mein mai mei me mien');
    add('ہم', 'hum ham');
    add('تم', 'tum');
    add('آپ', 'aap ap');
    add('وہ', 'wo woh wuh voh vo');
    add('یہ', 'ye yeh yah yea');
    add('اس', 'is iss us uss');
    add('ان', 'in inn un unn');
    add('میرا', 'mera meraa');
    add('میری', 'meri mairi');
    add('میرے', 'mere meray mairay');
    add('تیرا', 'tera');
    add('تیری', 'teri');
    add('تیرے', 'tere teray');
    add('ہمارا', 'hamara humara');
    add('ہماری', 'hamari humari');
    add('ہمارے', 'hamare humare hamaray');
    add('تمہارا', 'tumhara');
    add('تمہاری', 'tumhari');
    add('تمہارے', 'tumhare tumharay');
    add('آپ کا', 'apka aapka');
    add('آپ کی', 'apki aapki');
    add('آپ کے', 'apke aapke apkay aapkay');
    add('اس کا', 'uska iska');
    add('اس کی', 'uski iski');
    add('اس کے', 'uske iske uskay iskay');
    add('ان کا', 'unka inka');
    add('ان کی', 'unki inki');
    add('ان کے', 'unke inke unkay');
    add('اپنا', 'apna');
    add('اپنی', 'apni');
    add('اپنے', 'apne apnay');
    add('مجھے', 'mujhe mujhay mujhey');
    add('مجھ', 'mujh');
    add('تجھے', 'tujhe');
    add('ہمیں', 'hamein humein hamen');
    add('تمہیں', 'tumhein tumhen');
    add('انہیں', 'unhein unhen inhein');
    add('انہوں', 'unhon unho');
    add('کا', 'ka');
    add('کی', 'ki kee');
    add('کے', 'ke kay kai');
    add('کو', 'ko');
    add('سے', 'se say sey');
    add('پر', 'par per');
    add('پہ', 'pe pay');
    add('تک', 'tak');
    add('نے', 'ne nay');
    add('بھی', 'bhi bhee');
    add('ہی', 'hi');
    add('تو', 'to toh tu');
    add('اور', 'aur or');
    add('یا', 'ya yaa');
    add('لیکن', 'lekin laikin');
    add('مگر', 'magar');
    add('کیونکہ', 'kyunke kyunki kiyunke kyonke kionke');
    add('کیوں', 'kyun kyon kiyon kyu kiun');
    add('کیا', 'kya kia kiya');
    add('کون', 'kaun kon');
    add('کب', 'kab');
    add('کہاں', 'kahan kahaan kidhar');
    add('کہا', 'kaha');
    add('کیسے', 'kaise kese kaisay kesay');
    add('کیسا', 'kaisa kesa');
    add('کیسی', 'kaisi kesi');
    add('کتنا', 'kitna');
    add('کتنی', 'kitni');
    add('کتنے', 'kitne kitnay');
    add('جب', 'jab');
    add('تب', 'tab');
    add('اب', 'ab');
    add('ابھی', 'abhi abhee');
    add('پھر', 'phir fir');
    add('یہاں', 'yahan yahaan yaha idhar');
    add('وہاں', 'wahan wahaan waha udhar');
    add('اوپر', 'upar oopar');
    add('نیچے', 'neeche niche neechay');
    add('اندر', 'andar');
    add('باہر', 'bahar baahar');
    add('ساتھ', 'sath saath');
    add('لیے', 'liye liay lie liya_');
    add('بعد', 'baad bad');
    add('پہلے', 'pehle pehlay pahle pehley');
    add('ہے', 'hai hay he hy');
    add('ہیں', 'hain hen hein');
    add('ہو', 'ho');
    add('ہوں', 'hoon hun hu hon');
    add('تھا', 'tha thaa');
    add('تھی', 'thi thee');
    add('تھے', 'the thay they');
    add('رہا', 'raha rha');
    add('رہی', 'rahi rhi');
    add('رہے', 'rahe rahay rhe');
    add('گیا', 'gaya gya');
    add('گئی', 'gayi gai gaee');
    add('گئے', 'gaye gae gaey');
    add('ہوا', 'hua howa huwa');
    add('ہوئی', 'hui hoi huee');
    add('ہوئے', 'hue huay hoye');
    add('نہیں', 'nahi nahin nahee nai nhi nahein');
    add('نہ', 'na');
    add('مت', 'mat');
    add('ہاں', 'haan han ha');
    add('جی', 'ji jee');
    add('سب', 'sab');
    add('کچھ', 'kuch kuchh kuchch');
    add('کوئی', 'koi koee');
    add('صرف', 'sirf');
    add('بس', 'bas bus');
    add('زیادہ', 'zyada ziada zyaada ziyada');
    add('کم', 'kam');
    add('تھوڑا', 'thora thoda');
    add('تھوڑی', 'thori thodi');
    add('بہت', 'bohat bahut bohot buhat bhot');
    add('ہر', 'har');
    add('پورا', 'poora pura');
    add('پوری', 'poori puri');
    add('آدھا', 'aadha adha');
    add('والا', 'wala waala');
    add('والی', 'wali waali');
    add('والے', 'wale walay waale');
    add('چاہیے', 'chahiye chahie chahye chaiye');

    // Common verbs and their everyday forms.
    add('کرنا', 'karna');
    add('کرو', 'karo');
    add('کریں', 'karein karen kren');
    add('کرتا', 'karta');
    add('کرتی', 'karti');
    add('کرتے', 'karte kartay');
    add('کر', 'kar');
    add('کرے', 'kare karay');
    add('ہونا', 'hona');
    add('دینا', 'dena');
    add('دو', 'do');
    add('دیں', 'dein den');
    add('دیا', 'diya dia');
    add('دی', 'di');
    add('دے', 'de day');
    add('دیتے', 'dete detay');
    add('لینا', 'lena');
    add('لو', 'lo');
    add('لیں', 'lein len');
    add('لیا', 'liya lia');
    add('لی', 'li');
    add('لے', 'le lay');
    add('جانا', 'jana jaana');
    add('جاؤ', 'jao jaao');
    add('جائیں', 'jayen jaen jaein jaayen');
    add('جاتا', 'jata jaata');
    add('جاتی', 'jati jaati');
    add('جاتے', 'jate jaate jatay');
    add('آنا', 'aana ana');
    add('آؤ', 'aao ao');
    add('آئے', 'aaye aye aae');
    add('آیا', 'aaya aya');
    add('آئی', 'aayi ayi aai');
    add('آتا', 'aata ata');
    add('آتی', 'aati ati');
    add('آتے', 'aate ate');
    add('کھانا', 'khana khaana');
    add('کھاؤ', 'khao khaao');
    add('پینا', 'peena pina');
    add('دیکھنا', 'dekhna');
    add('دیکھو', 'dekho');
    add('دیکھ', 'dekh');
    add('دیکھا', 'dekha');
    add('سننا', 'sunna');
    add('سنو', 'suno');
    add('سن', 'sun');
    add('بولنا', 'bolna');
    add('بولو', 'bolo');
    add('لکھنا', 'likhna');
    add('لکھو', 'likho');
    add('لکھ', 'likh');
    add('پڑھنا', 'parhna padhna');
    add('پڑھو', 'parho padho');
    add('سمجھ', 'samajh samaj');
    add('سمجھو', 'samjho');
    add('چلو', 'chalo');
    add('چلنا', 'chalna');
    add('رکو', 'ruko');
    add('بھیجو', 'bhejo');
    add('بھیجنا', 'bhejna');
    add('بھیج', 'bhej');
    add('بھیجا', 'bheja');
    add('ملنا', 'milna');
    add('ملیں گے', 'milenge milain_ge');
    add('ملے گا', 'milega');
    add('رکھو', 'rakho');
    add('رکھنا', 'rakhna');
    add('بتاؤ', 'batao');
    add('بتائیں', 'bataen bataein bataiye');
    add('پوچھو', 'pucho poocho');
    add('سکتا', 'sakta');
    add('سکتی', 'sakti');
    add('سکتے', 'sakte saktay');
    add('چاہتا', 'chahta');
    add('چاہتی', 'chahti');
    add('خریدنا', 'kharidna khareedna');
    add('خریدا', 'kharida khareeda');
    add('بیچنا', 'bechna');
    add('بیچا', 'becha');

    // Everyday nouns and adjectives.
    add('گھر', 'ghar');
    add('کام', 'kaam kam_');
    add('نام', 'naam nam');
    add('بات', 'baat bat');
    add('باتیں', 'baatein batein baaten');
    add('لوگ', 'log');
    add('لوگوں', 'logon logo');
    add('دوست', 'dost');
    add('بھائی', 'bhai bhaai');
    add('بہن', 'behan bahan');
    add('امی', 'ammi ami');
    add('ابو', 'abbu abu');
    add('ابا', 'abba');
    add('بیٹا', 'beta');
    add('بیٹی', 'beti');
    add('بچہ', 'bacha bachcha');
    add('بچے', 'bache bachay bachche');
    add('آدمی', 'aadmi admi');
    add('عورت', 'aurat');
    add('پیار', 'pyar pyaar');
    add('محبت', 'mohabbat muhabbat mohabat');
    add('دل', 'dil');
    add('زندگی', 'zindagi');
    add('دنیا', 'duniya dunya');
    add('خوشی', 'khushi');
    add('خوش', 'khush');
    add('غم', 'gham');
    add('دکھ', 'dukh');
    add('خیال', 'khayal khyal khayaal');
    add('خبر', 'khabar');
    add('خط', 'khat');
    add('کتاب', 'kitab kitaab');
    add('سوال', 'sawal sawaal');
    add('جواب', 'jawab jawaab');
    add('مسئلہ', 'masla maslah masala_');
    add('مشکل', 'mushkil');
    add('آسان', 'aasan asaan aasaan');
    add('پانی', 'paani pani');
    add('چائے', 'chai chaye chae');
    add('روٹی', 'roti');
    add('شہر', 'shehar sheher shahar shehr');
    add('ملک', 'mulk malik');
    add('مالک', 'maalik');
    add('گاؤں', 'gaon gaaon gaun');
    add('سڑک', 'sarak sadak');
    add('راستہ', 'rasta raasta');
    add('دروازہ', 'darwaza darwaaza');
    add('کمرہ', 'kamra kamrah');
    add('مکان', 'makan makaan');
    add('دکان', 'dukan dukaan');
    add('دکاندار', 'dukandar dukaandar');
    add('بازار', 'bazar bazaar');
    add('چیز', 'cheez chiz');
    add('چیزیں', 'cheezen cheezein chizen');
    add('دن', 'din');
    add('رات', 'raat rat');
    add('صبح', 'subah subha');
    add('شام', 'shaam sham');
    add('آج', 'aaj aj');
    add('کل', 'kal kul');
    add('پرسوں', 'parson parsoon');
    add('وقت', 'waqt waqat');
    add('سال', 'saal sal');
    add('مہینہ', 'mahina maheena mahinah');
    add('مہینے', 'mahine maheenay mahinay');
    add('ہفتہ', 'hafta haftah');
    add('گھنٹہ', 'ghanta ghantah');
    add('گھنٹے', 'ghante ghantay');
    add('منٹ', 'minute mint');
    add('ٹھیک', 'theek thik theak');
    add('اچھا', 'acha achha accha achaa');
    add('اچھی', 'achi achhi acchi');
    add('اچھے', 'ache achhe achay acche');
    add('برا', 'bura');
    add('بری', 'buri');
    add('صحیح', 'sahi saheeh');
    add('غلط', 'galat ghalat');
    add('نیا', 'naya');
    add('نئی', 'nayi nai_');
    add('نئے', 'naye naey');
    add('پرانا', 'purana');
    add('پرانی', 'purani');
    add('بڑا', 'bara bada');
    add('بڑی', 'bari badi');
    add('بڑے', 'bare bade baray');
    add('چھوٹا', 'chota chhota');
    add('چھوٹی', 'choti chhoti');
    add('چھوٹے', 'chote chhote chotay');
    add('مہنگا', 'mehnga mahenga mehenga');
    add('سستا', 'sasta');
    add('خاص', 'khaas khas');
    add('عام', 'aam');
    add('ضروری', 'zaroori zaruri');
    add('ضرور', 'zaroor zarur');
    add('ممکن', 'mumkin');
    add('پسند', 'pasand');
    add('پریشان', 'pareshan pareshaan');
    add('محنت', 'mehnat mehnet');
    add('کامیاب', 'kamyab kaamyab');
    add('نقصان', 'nuqsan nuksan nuqsaan');
    add('فائدہ', 'faida fayda faaida');
    add('منافع', 'munafa');
    add('شکریہ', 'shukriya shukria shukriyah');
    add('مہربانی', 'meherbani mehrbani meharbani');
    add('معاف', 'maaf maf');
    add('معافی', 'maafi mafi');
    add('معذرت', 'maazrat mazrat maazarat');
    add('سلام', 'salam salaam');
    add('السلام', 'assalam asalam assalaam');
    add('علیکم', 'alaikum alaykum alekum');
    add('اللہ', 'allah');
    add('خدا', 'khuda');
    add('حافظ', 'hafiz');
    add('مبارک', 'mubarak mubaarak');
    add('عید', 'eid id_');
    add('شادی', 'shadi shaadi');
    add('دعوت', 'dawat daawat');
    add('مہمان', 'mehman mehmaan');
    add('تحفہ', 'tohfa tohfah');
    add('دعا', 'dua duaa');
    add('امید', 'umeed ummeed umeid');
    add('انتظار', 'intezar intizar intezaar');
    add('جلدی', 'jaldi');
    add('دیر', 'der dair');
    add('فوراً', 'foran fauran');
    add('ہمیشہ', 'hamesha humesha');
    add('کبھی', 'kabhi kabhie');
    add('روز', 'roz');
    add('روزانہ', 'rozana');
    add('ماہانہ', 'mahana maahana');
    add('سالانہ', 'salana saalana');
    add('تیز', 'tez');
    add('آہستہ', 'aahista ahista');
    add('گاڑی', 'gari gaari gaadi gadi');
    add('سفر', 'safar');

    // Business and invoice words.
    add('انوائس', 'invoice invoices');
    add('بل', 'bill bil');
    add('رسید', 'raseed rasid raseedh');
    add('قیمت', 'qeemat keemat qimat kimat');
    add('دام', 'daam');
    add('رقم', 'raqam rakam');
    add('جمع', 'jama jamaa');
    add('باقی', 'baqi baaqi baki');
    add('بقایا', 'baqaya bakaya baqaaya');
    add('ادھار', 'udhaar udhar_');
    add('ادائیگی', 'adaigi adaaigi adayigi adaegi');
    add('حساب', 'hisaab hisab');
    add('کھاتہ', 'khata khaata');
    add('کاروبار', 'karobar kaarobar karobaar');
    add('تجارت', 'tijarat tijaarat');
    add('گاہک', 'gahak gaahak grahak');
    add('خریدار', 'kharidar khareedar');
    add('فروخت', 'farokht farokhat');
    add('کرایہ', 'kiraya kiraaya kiraya');
    add('بجلی', 'bijli');
    add('مزدوری', 'mazdoori mazduri');
    add('مزدور', 'mazdoor mazdur');
    add('تنخواہ', 'tankhwah tankhwa tankhah');
    add('خدمت', 'khidmat');
    add('خدمات', 'khidmaat khidmat_');
    add('مرمت', 'marammat murammat');
    add('صفائی', 'safai safaai');
    add('سلائی', 'silai silaai silayi');
    add('کڑھائی', 'kadhai karhai kadhaai');
    add('کپڑا', 'kapra kapda');
    add('کپڑے', 'kapre kapde kapray');
    add('دوپٹہ', 'dupatta dupata');
    add('کرتا', 'kurta');
    add('شلوار', 'shalwar salwar');
    add('قمیض', 'qameez kameez');
    add('تھان', 'thaan');
    add('جوتا', 'joota juta');
    add('جوتے', 'joote jootay');
    add('سونا', 'sona');
    add('چاندی', 'chandi chaandi');
    add('لان', 'lawn');
    add('گز', 'gaz');
    add('کلو', 'kilo kg_');
    add('گرام', 'gram');
    add('درجن', 'darjan dozen');
    add('ڈبہ', 'dabba dabbah');
    add('بوری', 'bori');
    add('بوتل', 'botal bottle');
    add('چاول', 'chawal chaawal');
    add('آٹا', 'atta aata');
    add('چینی', 'cheeni chini');
    add('دودھ', 'doodh dudh');
    add('گھی', 'ghee ghi');
    add('تیل', 'tel tail');
    add('سبزی', 'sabzi sabzee');
    add('گوشت', 'gosht');
    add('مرغی', 'murghi murgi');
    add('انڈے', 'anday ande');
    add('پڑھائی', 'parhai padhai parhaai');
    add('استاد', 'ustad ustaad');
    add('تعلیم', 'taleem taaleem');
    add('امتحان', 'imtihan imtehan imtihaan');
    add('سبق', 'sabaq');
    add('مدرسہ', 'madrasa madrassa');
    add('مشورہ', 'mashwara mashwarah');
    add('علاج', 'ilaj ilaaj');
    add('دوا', 'dawa dawaa');
    add('دوائی', 'dawai dawaai');
    add('روپے', 'rupay rupaye rupees rupe');
    add('روپیہ', 'rupee rupia rupiya');
    add('پیسہ', 'paisa');
    add('پیسے', 'paise paisay pese');
    add('ہزار', 'hazar hazaar');
    add('لاکھ', 'lakh laakh');
    add('کروڑ', 'crore karor karod');
    add('سو', 'sau so');

    // English words that Urdu speakers write in Urdu script.
    add('ٹوٹل', 'total');
    add('ٹیکس', 'tax');
    add('ڈسکاؤنٹ', 'discount');
    add('ڈلیوری', 'delivery');
    add('پیکنگ', 'packing');
    add('سروس', 'service');
    add('ڈیزائن', 'design');
    add('لوگو', 'logo');
    add('ویب سائٹ', 'website');
    add('کیش', 'cash');
    add('بینک', 'bank');
    add('اکاؤنٹ', 'account');
    add('آن لائن', 'online');
    add('موبائل', 'mobile');
    add('فون', 'phone fone');
    add('نمبر', 'number numbr');
    add('آرڈر', 'order');
    add('ریٹ', 'rate');
    add('آئٹم', 'item');
    add('پیس', 'piece pcs_');
    add('میٹر', 'meter metre');
    add('باکس', 'box');
    add('کارٹن', 'carton');
    add('اسکول', 'school');
    add('کلاس', 'class');
    add('ٹیوشن', 'tuition');
    add('فیس', 'fee fees');
    add('ٹرانسپورٹ', 'transport');
    add('کمپیوٹر', 'computer');
    add('شاپ', 'shop');
    add('اسٹور', 'store');
    add('مارکیٹ', 'market');
    add('کمپنی', 'company');
    add('ٹریڈرز', 'traders');
    add('گارمنٹس', 'garments');
    add('ٹیکسٹائل', 'textile textiles');
    add('ہاؤس', 'house');
    add('سینٹر', 'center centre');
    add('روڈ', 'road');
    add('بلاک', 'block');
    add('پلازہ', 'plaza');
    add('آفس', 'office');
    add('ڈاکٹر', 'doctor');
    add('ٹکٹ', 'ticket');
    add('پیٹرول', 'petrol');
    add('سیمنٹ', 'cement');
    add('سریا', 'sariya saria');
    add('اینٹ', 'eent int_');
    add('پینٹ', 'paint');
    add('فریج', 'fridge');
    add('چارجر', 'charger');
    add('کیبل', 'cable');
    add('کارڈ', 'card');
    add('پرنٹ', 'print');
    add('کاپی', 'copy');
    add('فوٹو', 'photo foto');
    add('کیک', 'cake');
    add('بریانی', 'biryani biryaani');
    add('کالونی', 'colony');
    add('ٹاؤن', 'town');
    add('فیز', 'phase');

    // Numbers, months and days.
    add('ایک', 'ek aik');
    add('تین', 'teen');
    add('چار', 'char chaar');
    add('پانچ', 'panch paanch');
    add('چھ', 'chhe chay che');
    add('سات', 'saat');
    add('آٹھ', 'aath');
    add('نو', 'nau');
    add('دس', 'das');
    add('بیس', 'bees');
    add('پچاس', 'pachas pachaas');
    add('جنوری', 'january janwari');
    add('فروری', 'february farwari');
    add('مارچ', 'march');
    add('اپریل', 'april');
    add('مئی', 'may mayi');
    add('جون', 'june');
    add('جولائی', 'july');
    add('اگست', 'august');
    add('ستمبر', 'september');
    add('اکتوبر', 'october');
    add('نومبر', 'november');
    add('دسمبر', 'december');
    add('پیر', 'peer pir');
    add('منگل', 'mangal');
    add('بدھ', 'budh');
    add('جمعرات', 'jumerat jumeraat');
    add('جمعہ', 'juma jumma jumah');
    add('اتوار', 'itwar itwaar');

    // Names and places people put on invoices.
    add('محمد', 'muhammad mohammad mohammed muhammed');
    add('احمد', 'ahmed ahmad');
    add('علی', 'ali');
    add('حسن', 'hassan hasan');
    add('حسین', 'hussain husain hussein');
    add('عثمان', 'usman usmaan');
    add('عمر', 'umar umer');
    add('بلال', 'bilal');
    add('عمران', 'imran imraan');
    add('آصف', 'asif aasif');
    add('کامران', 'kamran');
    add('فیصل', 'faisal');
    add('طارق', 'tariq tariq');
    add('زاہد', 'zahid');
    add('ساجد', 'sajid');
    add('ندیم', 'nadeem');
    add('نوید', 'naveed');
    add('وقاص', 'waqas');
    add('حمزہ', 'hamza hamzah');
    add('عبداللہ', 'abdullah');
    add('رحمان', 'rehman rahman');
    add('خان', 'khan');
    add('شیخ', 'sheikh shaikh');
    add('بٹ', 'butt');
    add('چوہدری', 'chaudhry chaudhary choudhry');
    add('قریشی', 'qureshi');
    add('صدیقی', 'siddiqui siddiqi');
    add('راجہ', 'raja');
    add('مرزا', 'mirza');
    add('سید', 'syed sayed');
    add('شاہ', 'shah');
    add('فاطمہ', 'fatima fatimah');
    add('عائشہ', 'ayesha aisha aysha');
    add('زینب', 'zainab');
    add('مریم', 'maryam mariam');
    add('ثنا', 'sana');
    add('حنا', 'hina');
    add('سارہ', 'sara sarah');
    add('آمنہ', 'amna aamna');
    add('نادیہ', 'nadia');
    add('رابعہ', 'rabia');
    add('صائمہ', 'saima');
    add('نور', 'noor nur');
    add('پاکستان', 'pakistan');
    add('پاکستانی', 'pakistani');
    add('لاہور', 'lahore');
    add('کراچی', 'karachi');
    add('اسلام آباد', 'islamabad');
    add('راولپنڈی', 'rawalpindi pindi');
    add('فیصل آباد', 'faisalabad');
    add('ملتان', 'multan');
    add('پشاور', 'peshawar');
    add('کوئٹہ', 'quetta');
    add('سیالکوٹ', 'sialkot');
    add('گوجرانوالہ', 'gujranwala');
    add('حیدرآباد', 'hyderabad');
    add('صدر', 'saddar sadar');
    add('انارکلی', 'anarkali');
    add('گلبرگ', 'gulberg');
    add('گلی', 'gali galli');
    add('محلہ', 'mohalla muhalla');
    add('ٹاؤن', 'town');

    // Texting spellings and greetings.
    add('مجھے', 'muje mje mjhe mujy mujhy');
    add('تمہیں', 'tumhe tumhy');
    add('کیسے', 'kaisy kesy');
    add('ہے', 'hy');
    add('ان شاء اللہ', 'inshallah inshaallah inshaalah');
    add('ماشاءاللہ', 'mashallah mashaallah mashaalah');
    add('وعلیکم', 'walaikum walekum wa_alaikum');
    add('جزاک اللہ', 'jazakallah jazakallah');

    // More common words of Arabic and Persian origin, whose letters (ص ح ع ط ث ذ ظ ض)
    // cannot be guessed from English spelling.
    add('صحت', 'sehat sehet');
    add('صبر', 'sabar sabr');
    add('عزت', 'izzat izat');
    add('علم', 'ilm');
    add('حال', 'haal hal');
    add('حالات', 'halaat halat');
    add('حق', 'haq');
    add('سچ', 'sach');
    add('جھوٹ', 'jhoot jhut');
    add('وعدہ', 'waada wada');
    add('فیصلہ', 'faisla faislah');
    add('حکومت', 'hukumat hakumat');
    add('قانون', 'qanoon kanoon');
    add('عدالت', 'adalat adaalat');
    add('وکیل', 'wakeel vakeel');
    add('وجہ', 'wajah waja');
    add('طرح', 'tarah tarha');
    add('طریقہ', 'tareeqa tariqa tareeka');
    add('صاحب', 'sahib sahab saab');
    add('جناب', 'janab janaab');
    add('محترم', 'mohtaram muhtaram');
    add('قبول', 'qabool kabool');
    add('مطابق', 'mutabiq mutaabiq');
    add('معلوم', 'maloom maaloom maalum');
    add('ختم', 'khatam khatm');
    add('شروع', 'shuru shuroo');
    add('آخر', 'aakhir akhir');
    add('آخری', 'aakhri akhri');
    add('تاریخ', 'tareekh tarikh tareekh');
    add('تفصیل', 'tafseel tafsil');
    add('معاہدہ', 'muahida moahida muaahida');
    add('ذمہ', 'zimma zimmah');
    add('ضمانت', 'zamanat zamaanat');
    add('اجازت', 'ijazat ijaazat');
    add('اطلاع', 'ittala itlaa ittila');
    add('درخواست', 'darkhwast darkhast');
    add('شکایت', 'shikayat shikaayat');
    add('مسجد', 'masjid');
    add('عمارت', 'imarat imaarat');
    add('بارش', 'barish baarish');
    add('موسم', 'mausam mosam');
    add('پنجاب', 'punjab panjab');
    add('سندھ', 'sindh sindh');
    add('بلوچستان', 'balochistan baluchistan');
    add('ہسپتال', 'hospital haspatal aspatal');
    add('میٹنگ', 'meeting');
    add('رپورٹ', 'report');
    add('پروجیکٹ', 'project');
    add('ایڈوانس', 'advance');
    add('اپ ڈیٹ', 'update');
    add('فائل', 'file');
    add('پوسٹ', 'post');
    add('ٹیسٹ', 'test');

    // Entries written with a trailing underscore are deliberately unused
    // variants (they would clash with a more common word).
    Object.keys(WORDS).forEach(function (key) { if (/_$/.test(key)) delete WORDS[key]; });

    /* ---------- Phonetic rules for words not in the list ---------- */
    var CONSONANTS = [
        ['chh', 'چھ'], ['kh', null], ['gh', null], ['ch', 'چ'], ['sh', 'ش'], ['th', 'تھ'], ['dh', 'دھ'], ['bh', 'بھ'],
        ['ph', 'پھ'], ['jh', 'جھ'], ['rh', 'ڑھ'], ['zh', 'ژ'],
        ['b', 'ب'], ['p', 'پ'], ['t', 'ت'], ['d', 'د'], ['j', 'ج'], ['s', 'س'], ['z', 'ز'], ['r', 'ر'], ['f', 'ف'],
        ['q', 'ق'], ['k', 'ک'], ['g', 'گ'], ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['w', 'و'], ['v', 'و'], ['y', 'ی'],
        ['h', 'ہ'], ['x', 'کس'], ['c', 'ک']
    ];
    var VOWEL = /[aeiou]/;

    function consonantAt(word, index) {
        for (var i = 0; i < CONSONANTS.length; i += 1) {
            var pair = CONSONANTS[i];
            if (word.substr(index, pair[0].length) !== pair[0]) continue;
            var urdu = pair[1];
            // "kh" starts many Persian and Arabic words (khayal, khush); inside a
            // word it is usually the aspirated sound (dekh, rakh, likh).
            if (pair[0] === 'kh') urdu = index === 0 ? 'خ' : 'کھ';
            // "gh" starts aspirated words (ghar, ghanta); inside a word it is
            // usually غ (baghair).
            if (pair[0] === 'gh') urdu = index === 0 ? 'گھ' : 'غ';
            return { roman: pair[0], urdu: urdu };
        }
        return null;
    }

    function vowelRun(word, index) {
        var end = index;
        while (end < word.length && VOWEL.test(word.charAt(end))) end += 1;
        return word.slice(index, end);
    }

    function initialVowel(run, wholeWord) {
        if (/^aa/.test(run)) return 'آ' + medialVowel(run.slice(2), true);
        // "ai" on its own is the vocative اے; before a consonant it is ای (aisa).
        if (/^a[iy]/.test(run) || /^ae/.test(run)) return wholeWord ? 'اے' : 'ای';
        if (/^au/.test(run)) return 'او';
        if (/^a/.test(run)) return 'ا' + medialVowel(run.slice(1), true);
        if (/^(ee|ei|ey|e|ii)/.test(run)) return 'ای';
        if (/^i/.test(run)) return 'ا' + medialVowel(run.slice(1), true);
        if (/^(oo|ou|o|uu)/.test(run)) return 'او';
        return 'ا';
    }

    // Vowels inside a word: short a, i and u are not written; long vowels are.
    function medialVowel(run, afterVowel) {
        if (!run) return '';
        if (afterVowel) {
            // A second vowel straight after another one: hua, koi, hue.
            if (/^(i|ee)$/.test(run)) return 'ئی';
            if (/^(e|ay)$/.test(run)) return 'ئے';
            if (/^a/.test(run)) return 'ا';
            if (/^[ou]/.test(run)) return 'ؤ';
            return '';
        }
        if (/^aa/.test(run)) return 'ا' + medialVowel(run.slice(2), true);
        if (/^(ai|ay|ae)/.test(run)) return 'ی';
        if (/^(au|aw)/.test(run)) return 'و';
        if (/^(ee|ii|ei|ey|e)/.test(run)) return 'ی';
        if (/^(oo|ou|o|uu)/.test(run)) return 'و';
        if (/^a/.test(run)) return run.length > 1 ? medialVowel(run.slice(1), true) : '';
        if (/^i/.test(run)) return run.length > 1 ? 'ی' + medialVowel(run.slice(1), true) : '';
        if (/^u/.test(run)) return run.length > 1 ? 'و' + medialVowel(run.slice(1), true) : '';
        return '';
    }

    function finalVowel(run, single) {
        if (/^(aa|a|ah)$/.test(run)) return 'ا';
        if (/^(ai|aai)$/.test(run)) return single ? 'ائی' : 'ائی';
        if (/^(ao|aao|au)$/.test(run)) return 'اؤ';
        if (/^(aye|aaye|ae|aae)$/.test(run)) return 'ائے';
        if (/^(e|ay|ey|ae)$/.test(run)) return 'ے';
        if (/^(i|ee|ii|ey)$/.test(run)) return 'ی';
        if (/^(ie|iye|iyay)$/.test(run)) return 'یے';
        if (/^(ia|iya)$/.test(run)) return 'یا';
        if (/^(oi|ui|ooi)$/.test(run)) return 'وئی';
        if (/^(ue|oe|uye)$/.test(run)) return 'وئے';
        if (/^(ua|oa)$/.test(run)) return 'وا';
        if (/^(o|oo|u|uu|ou)$/.test(run)) return 'و';
        return medialVowel(run, false);
    }

    function spell(word) {
        // Doubled consonants are written once (no shadda in everyday Urdu).
        var w = word.replace(/([b-df-hj-np-tv-z])\1+/g, '$1');
        // A final "y" usually stands for ے in texting spellings (kaisy, hay).
        w = w.replace(/(?:ay|ey|([^aeiouy])y)$/, '$1e');
        var out = '', i = 0;
        // Common grammatical endings that the letter rules would misspell.
        var ending = '';
        var endings = [[/([^aeiou])on$/, 'وں'], [/([^aeiou])(ein|ain|en)$/, 'یں'], [/([^aeiou])yan$/, 'یاں'], [/([^aeiou])eh$/, 'ہ']];
        for (var e = 0; e < endings.length; e += 1) {
            var match = w.match(endings[e][0]);
            if (match && match.index + match[1].length > 0) { ending = endings[e][1]; w = w.slice(0, match.index + match[1].length); break; }
        }
        while (i < w.length) {
            var ch = w.charAt(i);
            if (VOWEL.test(ch)) {
                var run = vowelRun(w, i);
                var isFirst = i === 0, isLast = i + run.length === w.length;
                if (isFirst) out += initialVowel(run, isLast && !ending);
                else if (isLast && !ending) out += finalVowel(run, false);
                else if (isLast && ending) out += medialVowel(run, false);
                else out += medialVowel(run, false);
                i += run.length;
                continue;
            }
            var consonant = consonantAt(w, i);
            if (!consonant) { i += 1; continue; }
            out += consonant.urdu;
            i += consonant.roman.length;
        }
        return out + ending;
    }

    /* ---------- Public helpers ---------- */
    // Words that must stay exactly as typed: abbreviations (PKR, IBAN),
    // brand-style capitals (WhatsApp, iPhone), and anything with digits.
    // Short chat words and units that people keep in English letters.
    var KEEP = { ok: 1, okay: 1, plz: 1, pls: 1, thx: 1, rs: 1, kg: 1, km: 1, cm: 1, mm: 1, ml: 1, am: 1, pm: 1 };
    function isProtected(word) {
        if (!/^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(word)) return true;
        if (KEEP[word.toLowerCase()]) return true;
        if (word.length >= 2 && word === word.toUpperCase()) return true;
        if (/[a-z][A-Z]/.test(word)) return true;
        return false;
    }

    function transliterateWord(word) {
        var value = String(word || '');
        if (!value || isProtected(value)) return value;
        var key = value.toLowerCase().replace(/'/g, '');
        if (Object.prototype.hasOwnProperty.call(WORDS, key)) return WORDS[key];
        return spell(key) || value;
    }

    var PUNCTUATION = { '?': '؟', ',': '،', ';': '؛' };
    // Converts a whole passage, keeping numbers, emails, links and protected
    // words unchanged. Full stops stay as typed; ? , ; become Urdu marks
    // only right after a converted word.
    function transliterateText(text) {
        return String(text || '').replace(/(https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+|@\w+|\w*\d\w*)|([A-Za-z]+(?:'[A-Za-z]+)?)([?,;]?)/g, function (all, kept, word, mark) {
            if (kept) return kept;
            var converted = transliterateWord(word);
            return converted + (mark && converted !== word ? PUNCTUATION[mark] : mark);
        });
    }

    return { transliterateWord: transliterateWord, transliterateText: transliterateText, isProtected: isProtected, spell: spell, PUNCTUATION: PUNCTUATION, size: function () { return Object.keys(WORDS).length; } };
}));
