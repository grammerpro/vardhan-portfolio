from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/readme'
OUT.mkdir(parents=True, exist_ok=True)
def font(size):
    return ImageFont.truetype('C:/Windows/Fonts/consola.ttf', size)
def save(frames, name, duration):
    frames[0].save(OUT / name, save_all=True, append_images=frames[1:], duration=duration, loop=0, optimize=True, disposal=2)
frames=[]
for n in range(40):
    im=Image.new('RGB',(1100,300),'#101419'); d=ImageDraw.Draw(im)
    for x in range(0,1100,40): d.line((x,0,x,300),fill='#1b242b')
    for y in range(0,300,40): d.line((0,y,1100,y),fill='#1b242b')
    d.text((45,30),'VARDHAN / INSIDE THE SYSTEM',font=font(18),fill='#94c9d4')
    d.text((45,90),'ENGINEERED TO',font=font(48),fill='#f2eee6')
    d.text((45,148),'BE EXPLORED.',font=font(48),fill='#f2eee6')
    d.text((45,250),'SYSTEMS / INTERACTION / EVIDENCE',font=font(16),fill='#a4afb8')
    shift=20*(1-math.cos(n/40*math.tau))
    d.polygon([(790-shift,60),(825-shift,60),(884-shift,185),(866-shift,226)],fill='#91b5c2')
    d.polygon([(889+shift,185),(946+shift,60),(985+shift,60),(912+shift,226),(869+shift,226)],fill='#e4d7bd')
    for k in range(3):
        a=n/40*math.tau+k*math.tau/3; x,y=888+140*math.cos(a),143+115*math.sin(a)
        d.ellipse((x-3,y-3,x+3,y+3),fill='#94c9d4')
    frames.append(im)
save(frames,'system-banner.gif',100)
frames=[]
for filename,label in [('desktop-hero.png','01 / ARRIVE'),('desktop-unfold.png','02 / UNFOLD'),('desktop-chroma-loop.png','03 / EXPLORE'),('desktop-contact.png','04 / CONNECT')]:
    shot=Image.open(ROOT/'docs/evidence/review'/filename).convert('RGB')
    im=Image.new('RGB',(960,570),'#101419'); im.paste(ImageOps.fit(shot,(960,530)),(0,40))
    ImageDraw.Draw(im).text((20,10),label,font=font(17),fill='#94c9d4'); frames.append(im)
save(frames,'portfolio-tour.gif',2400)
frames=[]
for n in range(32):
    im=Image.new('RGB',(1100,12),'#101419'); d=ImageDraw.Draw(im)
    for x in range(1100):
        s=(1+math.sin(x/120-n/32*math.tau))/2
        d.line((x,5,x,7),fill=(int(35+110*s),int(50+140*s),int(60+145*s)))
    frames.append(im)
save(frames,'signal-divider.gif',90)
print('Generated three local README animations')
