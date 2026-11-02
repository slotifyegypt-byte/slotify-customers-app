import { publicUrl } from './storage';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `https://example.supabase.co/storage/v1/object/public/${bucket}/${path}`,
          },
        }),
      }),
    },
  },
}));

describe('publicUrl', () => {
  it('returns null when there is no path', () => {
    expect(publicUrl(null)).toBeNull();
    expect(publicUrl(undefined)).toBeNull();
    expect(publicUrl('')).toBeNull();
  });

  it('resolves against public-media by default', () => {
    expect(publicUrl('branches/b/p.jpg')).toMatch(
      /\/storage\/v1\/object\/public\/public-media\/branches\/b\/p\.jpg$/,
    );
  });

  it('resolves against the requested bucket', () => {
    expect(publicUrl('u/a.jpg', 'avatars')).toMatch(/\/public\/avatars\/u\/a\.jpg$/);
  });
});
