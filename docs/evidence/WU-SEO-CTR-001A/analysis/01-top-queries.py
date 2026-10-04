import csv,io,re,sys
G='docs/evidence/WU-SEO-CTR-001A/gsc/'
def rd(p):
    return list(csv.DictReader(open(p,encoding='utf-8-sig')))
q=rd(G+'Queries-part-01.csv')+rd(G+'Queries-part-02.csv')
print(q[0].keys(), len(q))
def n(x): return int(str(x).replace(',',''))
def f(x): return float(str(x).replace('%','').replace(',',''))
for r in q: r['c']=n(r['Clicks']); r['i']=n(r['Impressions']); r['p']=f(r['Position']); r['q']=r['Top queries']
T=sum(r['i'] for r in q); C=sum(r['c'] for r in q)
print('1000 queries cover imps',T,'clicks',C)
print('--top by impressions')
for r in sorted(q,key=lambda r:-r['i'])[:45]:
    print(f"{r['i']:>8} {r['c']:>6} {r['c']/r['i']*100:5.2f}% {r['p']:5.1f}  {r['q']}")
print('--top by clicks')
for r in sorted(q,key=lambda r:-r['c'])[:25]:
    print(f"{r['c']:>6} {r['i']:>8} {r['c']/r['i']*100:5.2f}% {r['p']:5.1f}  {r['q']}")
