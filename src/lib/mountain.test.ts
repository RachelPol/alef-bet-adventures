import { describe, expect, it } from 'vitest';
import { advanceMountain, INITIAL_MOUNTAIN, mountainMilestone, mountainPosition } from './mountain';
describe('90-success mountain rules', () => {
  it('counts the first success exactly one step', () => { expect(advanceMountain(INITIAL_MOUNTAIN, 'success').streak).toBe(1); });
  it('nine successes have no station; ten reach the backpack', () => {
    expect(mountainMilestone(8,9)).toBeNull(); expect(mountainMilestone(9,10)?.reward).toBe('תרמיל טיולים');
  });
  it('resets 45 successes on a mistake but retains earlier summit achievements', () => {
    expect(advanceMountain({streak:45,completions:2,version:4},'mistake')).toEqual({streak:0,completions:2,version:5});
  });
  it('rewards the 90th success once and holds the summit until a new challenge', () => {
    const summit=advanceMountain({streak:89,completions:0,version:89},'success');
    expect(summit).toEqual({streak:90,completions:1,version:90});
    expect(advanceMountain(summit,'success').completions).toBe(1);
    expect(advanceMountain(summit,'mistake').streak).toBe(90);
    expect(advanceMountain(summit,'restart').streak).toBe(0);
    expect(advanceMountain(summit,'restart').completions).toBe(1);
  });
  it('keeps reading and listening independent', () => {
    const activities={listen:INITIAL_MOUNTAIN,read:INITIAL_MOUNTAIN};
    activities.listen=advanceMountain(activities.listen,'success');
    expect(activities.listen.streak).toBe(1); expect(activities.read.streak).toBe(0);
  });
  it('has 91 distinct positions including base and peak', () => {
    const positions=Array.from({length:91},(_,i)=>mountainPosition(i));
    expect(new Set(positions.map(p=>`${p.x},${p.y}`)).size).toBe(91);
    expect(positions[0]).toEqual({x:50,y:96}); expect(positions[90]).toEqual({x:50,y:6});
  });
});