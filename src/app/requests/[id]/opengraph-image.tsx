import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const alt = 'A MISHTEH community support request';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function label(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await prisma.request.findFirst({
    where: { id, status: { in: ['ACTIVE', 'PARTIALLY_FUNDED'] } },
    select: { title: true, category: true, location: true, targetAmount: true, user: { select: { fullName: true } } },
  });
  const title = request?.title || 'A community story needs your support';
  const category = request ? label(request.category) : 'Community Support';
  const goal = request?.targetAmount ? `Goal: R ${request.targetAmount.toLocaleString('en-ZA')}` : 'Every act of kindness matters';

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#08140e', color: 'white', padding: '68px 76px', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: 999, background: '#16a34a', opacity: 0.22, right: -140, top: -210 }} />
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: 999, background: '#0d9488', opacity: 0.18, left: -190, bottom: -260 }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#22c55e', fontSize: 34 }}>♥</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 29, fontWeight: 800, letterSpacing: 2 }}>MISHTEH</span><span style={{ fontSize: 16, color: '#a7f3d0' }}>People helping people</span></div>
          </div>
          <div style={{ display: 'flex', border: '2px solid #34d399', borderRadius: 999, padding: '10px 20px', color: '#a7f3d0', fontSize: 17, fontWeight: 700 }}>ADMIN APPROVED STORY</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 970 }}>
          <div style={{ display: 'flex', color: '#4ade80', fontSize: 22, fontWeight: 700, marginBottom: 18 }}>{category}</div>
          <div style={{ display: 'flex', fontSize: title.length > 60 ? 48 : 58, lineHeight: 1.08, fontWeight: 850, letterSpacing: -1.5 }}>{title.slice(0, 105)}</div>
          <div style={{ display: 'flex', marginTop: 24, gap: 28, fontSize: 21, color: '#d1fae5' }}><span>📍 {request?.location || 'Community request'}</span><span>•</span><span>{goal}</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #28513a', paddingTop: 24 }}>
          <span style={{ fontSize: 18, color: '#9ca3af' }}>{request ? `Shared for ${request.user.fullName}` : 'View the full story'}</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>mishteh.org →</span>
        </div>
      </div>
    </div>,
    size,
  );
}
