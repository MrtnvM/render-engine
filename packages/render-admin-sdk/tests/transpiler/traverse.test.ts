import { describe, it, expect } from 'vitest';
import { traverse } from '../../src/transpiler/traverse';
import { parse } from '@babel/parser';

describe('traverse', () => {
  it('should be a function', () => {
    expect(typeof traverse).toBe('function');
  });

  it('should traverse the AST', () => {
    const code = 'const a = 1;';
    const ast = parse(code);
    let visited = false;

    traverse(ast, {
      enter(path) {
        if (path.isIdentifier({ name: 'a' })) {
          visited = true;
        }
      },
    });

    expect(visited).toBe(true);
  });
});
