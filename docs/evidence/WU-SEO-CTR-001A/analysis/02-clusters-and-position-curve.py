import csv,re,collections
G='docs/evidence/WU-SEO-CTR-001A/gsc/'
def rd(p): return list(csv.DictReader(open(p,encoding='utf-8-sig')))
q=rd(G+'Queries-part-01.csv')+rd(G+'Queries-part-02.csv')
n=lambda x:int(str(x).replace(',',''))
f=lambda x:float(str(x).replace('%',''))
for r in q: r['c']=n(r['Clicks']);r['i']=n(r['Impressions']);r['p']=f(r['Position']);r['q']=r['Top queries']
# CTR by position bucket
print('pos bucket: imps clicks ctr  (all) | excluding english-to-urdu* family')
def fam(s):
    if re.search(r'\benglish (to|into|in)\b.*urdu|\bengli?sh urdu\b|\burdu english\b',s) and not re.search(r'keyboard|font',s): return 'en2ur'
    return None
for name,flt in [('all',lambda r:True),('excl_en2ur',lambda r:not fam(r['q']))]:
    b=collections.defaultdict(lambda:[0,0])
    for r in q:
        if not flt(r):continue
        k=int(r['p']) if r['p']<10 else 10
        b[k][0]+=r['i'];b[k][1]+=r['c']
    print(name,[(k,v[0],v[1],round(v[1]/v[0]*100,2)) for k,v in sorted(b.items())])
# clusters
CL=[('brand/editor',r'write urdu|writeurdu|write-urdu|urdu writer|urdu editor|editor|urdu writing online|online urdu writing|urdu text editor'),
('inpage/unicode',r'inpage|in page|unicode'),
('en2ur typing/translation',None),
('roman/translit',r'roman|translit'),
('keyboard',r'keyboard|key board'),
('typing generic',r'typing|type urdu|type in urdu|urdu type|typing'),
('fonts',r'font'),
('stylish/name',r'stylish|name|style|dp|design|art|status|card|poetry|poster'),
('voice',r'voice|speech|speak|audio'),
('ocr/image',r'ocr|image to|photo to|picture to'),
('writing generic',r'write|writing')]
used=set();out=[]
for nm,rx in CL:
    t=[0,0,0.0];qs=[]
    for k,r in enumerate(q):
        if k in used:continue
        hit = (fam(r['q']) is not None) if nm=='en2ur typing/translation' else re.search(rx,r['q'])
        if hit:
            used.add(k);t[0]+=r['i'];t[1]+=r['c'];t[2]+=r['p']*r['i'];qs.append(r)
    out.append((nm,t,qs))
for nm,t,qs in out:
    print(f"{nm:26} n={len(qs):4} imps={t[0]:>8} clicks={t[1]:>6} ctr={t[1]/max(t[0],1)*100:5.2f}% pos={t[2]/max(t[0],1):.1f}")
rest=[r for k,r in enumerate(q) if k not in used]
print('rest',len(rest),sum(r['i'] for r in rest),sum(r['c'] for r in rest))
print('\nen2ur family detail (imps>=300):')
for nm,t,qs in out:
    if nm.startswith('en2ur'):
        for r in sorted(qs,key=lambda r:-r['i'])[:30]: print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
print('\nroman/translit:')
for r in sorted([r for nm,t,qs in out if nm=='roman/translit' for r in qs],key=lambda r:-r['i'])[:25]: print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
print('\ninpage:')
for r in sorted([r for nm,t,qs in out if nm=='inpage/unicode' for r in qs],key=lambda r:-r['i'])[:25]: print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
print('\nkeyboard:')
for r in sorted([r for nm,t,qs in out if nm=='keyboard' for r in qs],key=lambda r:-r['i'])[:15]: print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
print('\nfonts:')
for r in sorted([r for nm,t,qs in out if nm=='fonts' for r in qs],key=lambda r:-r['i'])[:12]: print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
print('\nvoice/ocr/typing-test mentions:')
for r in q:
    if re.search(r'voice|speech|test|practice|speed|wpm|ocr|master|ppsc|fpsc',r['q']): print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
# pos 3-10 high-imps low-ctr, excluding the top ones
print('\nposition 3-10, imps>=1000, ctr<1.5%:')
for r in sorted(q,key=lambda r:-r['i']):
    if 3<=r['p']<=10 and r['i']>=1000 and r['c']/r['i']<0.015: print(f"{r['i']:>8} {r['c']:>5} {r['c']/r['i']*100:5.2f}% {r['p']:4.1f} {r['q']}")
