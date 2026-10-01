import zlib, struct, sys
SP=sys.argv[1]; names=sys.argv[2:]
def readpng(p):
    d=open(p,'rb').read(); pos=8; idat=b''; w=h=0
    while pos<len(d):
        l=struct.unpack('>I',d[pos:pos+4])[0]; t=d[pos+4:pos+8]; c=d[pos+8:pos+8+l]
        if t==b'IHDR': w,h=struct.unpack('>II',c[:8])
        if t==b'IDAT': idat+=c
        pos+=12+l
    raw=zlib.decompress(idat); return w,h,[raw[y*(w*3+1)+1:(y+1)*(w*3+1)] for y in range(h)]
imgs=[readpng(SP+'/'+n+'.png') for n in names]
w,h=imgs[0][0],imgs[0][1]; rows=(len(imgs)+1)//2
out=bytearray()
for r in range(rows):
    for y in range(h):
        a=imgs[r*2][2][y]; b=imgs[r*2+1][2][y] if r*2+1<len(imgs) else bytes(w*3)
        out+=b'\x00'+a+b
def chunk(t,data): return struct.pack('>I',len(data))+t+data+struct.pack('>I',zlib.crc32(t+data)&0xffffffff)
open(SP+'/sheet.png','wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w*2,h*rows,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(out)))+chunk(b'IEND',b''))
