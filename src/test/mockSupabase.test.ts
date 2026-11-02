import { mockQuery } from './mockSupabase';

describe('mockQuery', () => {
  it('resolves to the given result when awaited', async () => {
    const { builder } = mockQuery({ data: [{ id: 1 }], count: 1 });
    await expect(builder).resolves.toEqual({ data: [{ id: 1 }], count: 1 });
  });

  it('chains every method back to itself and records the calls', async () => {
    const { builder, calls } = mockQuery({ data: [], error: null });
    const chained = builder.select('*').eq('id', 1).order('name');
    expect(chained).toBe(builder);
    await builder;
    expect(calls).toEqual([
      ['select', ['*']],
      ['eq', ['id', 1]],
      ['order', ['name']],
    ]);
  });

  it('resolves the error result at the end of a chain', async () => {
    const { builder } = mockQuery({ error: { message: 'x' } });
    const { error } = await builder.single();
    expect(error).toEqual({ message: 'x' });
  });
});
