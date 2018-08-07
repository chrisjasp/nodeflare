import 'babel-polyfill'
import assert from 'assert';
import {NodeFlare} from '../../src/index';

describe('NodeFlare App', function() {

  before(() => {
    // return UserTestIocBuilder.build();
  });

  it('Port Set Success', () => {
    let nf = new NodeFlare({hostname: '', tokenkey:  '', port: 555, database: {}});
    assert.equal(nf.port, 555);
  });

  it('Di initialization Success', () => {
    let nf = new NodeFlare({hostname: '', tokenkey:  '', port: 555, database: {}});
    ctx.initialize();
    let appRoot = ctx.get('AppRoot');
    assert.equal(appRoot.config.port, 555);
  });
});
