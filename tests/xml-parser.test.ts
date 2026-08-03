import { parseXML } from '../src/helpers/xml/parser';

describe('XML parser entities', () => {
  test('decodes standard entities in text and attributes', () => {
    const parsed = parseXML<{
      root: {
        '@_attribute': string;
        decimal: string;
        hexadecimal: string;
        text: string;
      };
    }>(
      '<Root attribute="&quot;quoted&quot;">' +
        '<Text>&lt;tag&gt; &amp; &apos;quote&apos;</Text>' +
        '<Decimal>&#38;</Decimal>' +
        '<Hexadecimal>&#x26;</Hexadecimal>' +
      '</Root>',
      '2.0',
    );

    expect(parsed.root).toEqual({
      '@_attribute': '"quoted"',
      decimal: '&',
      hexadecimal: '&',
      text: "<tag> & 'quote'",
    });
  });

  test('decodes custom doctype entities', () => {
    const parsed = parseXML<{ root: { text: string } }>(
      '<!DOCTYPE Root [<!ENTITY company "Transport">]>' +
        '<Root><Text>&company;</Text></Root>',
      '2.0',
    );

    expect(parsed.root.text).toBe('Transport');
  });
});
