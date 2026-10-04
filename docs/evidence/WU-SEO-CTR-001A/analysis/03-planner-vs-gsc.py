import csv,io,re,collections
t=open('kw.csv',encoding='utf-16').read().splitlines()
rows=list(csv.reader(io.StringIO('\n'.join(t[2:])),delimiter='\t'))
h=rows[0]; K=[]
for r in rows[3:]:
    if not r[0]:continue
    K.append(dict(k=r[0].strip().lower(),v=float(r[3] or 0),yoy=r[5],comp=r[6],m=[float(x or 0) for x in r[14:26]]))
print(len(K), collections.Counter(int(k['v']) for k in K))
G='docs/evidence/WU-SEO-CTR-001A/gsc/'
def rd(p): return list(csv.DictReader(open(p,encoding='utf-8-sig')))
q=rd(G+'Queries-part-01.csv')+rd(G+'Queries-part-02.csv')
g={}
for r in q:
    g[r['Top queries'].strip().lower()]=(int(r['Impressions'].replace(',','')),int(r['Clicks'].replace(',','')),float(r['Position']))
CL=[('en2ur (translation-ambiguous)',r'^english (to|into) urdu$|english to urdu (translat|text|word|sentence|convert|dictionary)|translat|^english urdu|urdu english|^english to urdu\b(?!.*(typ|keyboard|writ|font|stylish))|meaning'),
('en2ur typing/keyboard/write',r'english.*urdu.*(typ|keyboard|writ)|(typ|writ).*english.*urdu'),
('roman/translit',r'roman|translit'),
('inpage→unicode',r'inpage to unicode|in page to unicode|inpage.*converter|convert inpage|inpage text to unicode'),
('unicode→inpage',r'unicode.*inpage|to inpage|text to inpage|convert.*inpage'),
('inpage other',r'inpage|in page'),
('urdu fonts',r'font'),
('keyboard',r'keyboard'),
('typing test/practice',r'typing (test|practice|speed|master|lesson|course)|typing.*test'),
('voice',r'voice|speech|speak|audio|dictat'),
('stylish/name/design',r'stylish|name|dp\b|design|art\b|card|poetry|poster|status|calligraph|copy and paste|copy paste'),
('urdu typing',r'typing|type urdu|type in urdu|urdu type'),
('writing/editor',r'writ|editor|notepad|word|document')]
cl=collections.defaultdict(list); 
for k in K:
    for nm,rx in CL:
        if re.search(rx,k['k']): cl[nm].append(k);k['cl']=nm;break
    else: k['cl']='other'; cl['other'].append(k)
print(f"{'cluster':32}{'n':>4}{'plannerSum':>11}{'gscImps(3mo)':>13}{'gscClk':>7}")
for nm,_ in CL+[('other',0)]:
    L=cl[nm]; pv=sum(k['v'] for k in L); gi=sum(g.get(k['k'],(0,0,0))[0] for k in L); gc=sum(g.get(k['k'],(0,0,0))[1] for k in L)
    print(f"{nm:32}{len(L):>4}{pv:>11,.0f}{gi:>13,}{gc:>7}")
print('\nTop planner keywords with GSC:')
for k in sorted(K,key=lambda k:-k['v'])[:70]:
    gi=g.get(k['k']); print(f"{k['v']:>9,.0f} {k['yoy']:>6} {k['comp']:>6} | {('%d imps %d clk pos %.1f'%gi) if gi else '— not in GSC top1000':32} | {k['cl'][:14]:14} | {k['k']}")
print('\nPlanner kws >=500 and NOT in GSC top1000:')
for k in sorted(K,key=lambda k:-k['v']):
    if k['v']>=500 and k['k'] not in g: print(f"{k['v']:>9,.0f} {k['cl'][:14]:14} {k['k']}")

print('\n=== overlap planner vs gsc')
inn=[k for k in K if k['k'] in g]; print(len(inn),'of',len(K),'planner kws appear in GSC top1000')
notin=[k for k in K if k['k'] not in g]
print('not in GSC:',[ (k['k'],int(k['v'])) for k in sorted(notin,key=lambda k:-k['v'])[:40]])
