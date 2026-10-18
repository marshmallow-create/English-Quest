import '../../../scripts/identity.js';
import './handler.js';

Deno.serve(globalThis.QuestUsernameAuth.createHandler({env:name=>Deno.env.get(name)}));
