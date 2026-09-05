import { describe, it, expect } from 'vitest';
import { evaluate, renderCell } from './expr';

const row = { nome: 'Ana', idade: 30, preco: 1500.5, data: '2024-01-15', ativo: true };

describe('expr — evaluate', () => {
  it('retorna o valor da variável', () => {
    expect(evaluate('value', { value: 42, row })).toBe('42');
    expect(evaluate('value', { value: 'texto', row })).toBe('texto');
  });

  it('acessa propriedades do row', () => {
    expect(evaluate('row.nome', { value: undefined, row })).toBe('Ana');
    expect(evaluate('row.ativo', { value: undefined, row })).toBe('true');
  });

  it('suporta literais', () => {
    expect(evaluate("'sim'", { value: undefined, row })).toBe('sim');
    expect(evaluate("'não'", { value: undefined, row })).toBe('não');
    expect(evaluate('42', { value: undefined, row })).toBe('42');
    expect(evaluate('true', { value: undefined, row })).toBe('true');
    expect(evaluate('null', { value: undefined, row })).toBe('');
  });

  it('suporta operadores de comparação', () => {
    expect(evaluate('value > 30', { value: 35, row })).toBe('true');
    expect(evaluate('value > 30', { value: 25, row })).toBe('false');
    expect(evaluate('value == 30', { value: 30, row })).toBe('true');
    expect(evaluate('value != 30', { value: 25, row })).toBe('true');
  });

  it('suporta operadores aritméticos', () => {
    expect(evaluate('value + 10', { value: 5, row })).toBe('15');
    expect(evaluate('value - 10', { value: 25, row })).toBe('15');
    expect(evaluate('value * 2', { value: 5, row })).toBe('10');
    expect(evaluate('value / 2', { value: 10, row })).toBe('5');
  });

  it('suporta ternário', () => {
    expect(evaluate("value > 30 ? 'sênior' : 'júnior'", { value: 35, row })).toBe('sênior');
    expect(evaluate("value > 30 ? 'sênior' : 'júnior'", { value: 25, row })).toBe('júnior');
    expect(evaluate("value ? 'sim' : 'não'", { value: true, row })).toBe('sim');
  });

  it('suporta aninhamento de parênteses', () => {
    expect(evaluate("(value + 5) * 2", { value: 3, row })).toBe('16');
  });
});

describe('expr — pipes', () => {
  it('currency formata como moeda BRL', () => {
    const result = evaluate('value | currency', { value: 1500.5, row });
    expect(result).toContain('R$');
    expect(result).toContain('1.500,50');
  });

    it('date formata data no estilo pt-BR', () => {
    const result = evaluate("value | date", { value: new Date(2024, 0, 15), row });
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('date com estilo short', () => {
    const result = evaluate("value | date: 'short'", { value: new Date(2024, 0, 15), row });
    expect(result).toMatch(/15\/01\/2024/);
  });

  it('dateTime formata data e hora', () => {
        const result = evaluate('value | dateTime', { value: new Date(2024, 0, 15, 10, 30, 0), row });
    expect(result).toContain('2024');
  });

  it('number formata com casas decimais', () => {
    expect(evaluate('value | number', { value: 1234.5, row })).toContain('1.234,5');
    expect(evaluate('value | number: 2', { value: 1234.5, row })).toBe('1.234,50');
  });

  it('pipe desconhecido retorna o valor como string', () => {
    expect(evaluate('value | unknown', { value: 'teste', row })).toBe('teste');
  });
});

describe('expr — renderCell', () => {
  it('substitui múltiplas expressões no template', () => {
    const html = renderCell('Olá {{ value }}! Tem {{ row.idade }} anos.', row, 'nome');
    expect(html).toBe('Olá Ana! Tem 30 anos.');
  });

  it('processa HTML com pipes e ternário', () => {
    const template = '<span class="badge {{ row.ativo ? \'on\' : \'off\' }}">{{ value | currency }}</span>';
    const html = renderCell(template, row, 'preco');
    expect(html).toContain('badge on');
    expect(html).toContain('R$');
    expect(html).toContain('1.500,50');
  });

  it('permite interpolar atributos dinâmicos (ícones)', () => {
    const template = '<i class="pi pi-{{ row.ativo ? \'check\' : \'times\' }}"></i>';
    const html = renderCell(template, row, 'nome');
    expect(html).toContain('pi-check');
  });

  it('retorna template vazio quando não há expressões', () => {
    expect(renderCell('texto estático', row, 'nome')).toBe('texto estático');
  });

  it('trata valor nulo/undefined graciosamente', () => {
    const html = renderCell('{{ value | currency }}', { nome: null } as any, 'nome');
    expect(html).toBe('');
  });

  it('escapa HTML do valor interpolado (previne XSS)', () => {
    const html = renderCell('<b>{{ value }}</b>', { nome: '<img src=x onerror=alert(1)>' } as any, 'nome');
    expect(html).toBe('<b>&lt;img src&#x3D;x onerror&#x3D;alert(1)&gt;</b>');
  });
});
