import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { DataType } from '../src'
import { JsonViewer } from '../src'

function aPlusB (a: number, b: number) {
  return a + b
}

const loopObject = {
  foo: 1,
  goo: 'string'
} as Record<string, any>

loopObject.self = loopObject

const loopArray = [
  loopObject
]

loopArray[1] = loopArray

const longArray = Array.from({ length: 1000 }).map((_, i) => i)
const map = new Map<any, any>()
map.set('foo', 1)
map.set('goo', 'hello')
map.set({}, 'world')

const set = new Set([1, 2, 3])

const superLongString = '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'

const full = {
  loopObject,
  loopArray,
  longArray,
  string: 'this is a string',
  integer: 42,
  array: [19, 19, 810, 'test', NaN],
  nestedArray: [
    [1, 2],
    [3, 4]
  ],
  map,
  set,
  float: 114.514,
  undefined,
  superLongString,
  object: {
    'first-child': true,
    'second-child': false,
    'last-child': null
  },
  fn: aPlusB,
  string_number: '1234',
  timer: 0,
  date: new Date('Tue Sep 13 2022 14:07:44 GMT-0500 (Central Daylight Time)'),
  bigint: 123456789087654321n
}

describe('render <JsonViewer/>', () => {
  it('render undefined', () => {
    render(<JsonViewer value={undefined}/>)
  })

  it('render null', () => {
    render(<JsonViewer value={null}/>)
  })

  it('render null', () => {
    render(<JsonViewer value={null}/>)
  })

  it('render NaN', () => {
    render(<JsonViewer value={NaN}/>)
  })

  it('render number', () => {
    render(<JsonViewer value={1}/>)
    render(<JsonViewer value={-0}/>)
    render(<JsonViewer value={+0}/>)
    render(<JsonViewer value={114514}/>)
    render(<JsonViewer value={114.514}/>)
    render(<JsonViewer value={Infinity}/>)
  })

  it('render bigint', () => {
    render(<JsonViewer value={114514n}/>)
  })

  it('render array', () => {
    render(<JsonViewer value={[1, '2', 3.0, Infinity]}/>)
    render(<JsonViewer value={new Array(1e5).fill(1)}/>)
  })

  it('render Set', () => {
    render(<JsonViewer value={new Set([1, '2', 3.0, Infinity])}/>)
  })

  it('render Map', () => {
    render(
      <JsonViewer
        value={new Map<string, number>([['foo', 1], ['goo', 2]])}/>
    )
    render(
      <JsonViewer
        value={new Map<any, number>([[[], 1], [{}, 2]])}/>
    )
  })

  it('render object', () => {
    render(<JsonViewer value={{}}/>)
    render(<JsonViewer value={{
      foo: '1',
      goo: 2,
      hoo: {
        foo: [1, 2, 3]
      }
    }}/>)
  })

  it('render function', () => {
    render(<JsonViewer value={function aPlusB (a: number, b: number) {
      return a + b
    }}/>)
    render(<JsonViewer value={(a: number, b: number) => a + b}/>)
  })

  it('render full', () => {
    render(<JsonViewer value={full}/>)
  })
})
describe('render <JsonViewer/> with multiple instances', () => {
  it('render', () => {
    const { container } = render(
      <>
        <JsonViewer
          rootName={false}
          value={undefined}
          valueTypes={[
            {
              is: () => true,
              serialize: () => 'first viewer',
              Component: () => {
                return <>first viewer</>
              }
            }
          ]}
        />
        <JsonViewer
          rootName={false}
          value={undefined}
          valueTypes={[
            {
              is: () => true,
              serialize: () => 'second viewer',
              Component: () => {
                return <>second viewer</>
              }
            }
          ]}
        />
      </>
    )
    expect(container.children.length).eq(2)
    expect(container.children.item(0)!.textContent).eq('first viewer')
    expect(container.children.item(1)!.textContent).eq('second viewer')
  })
})

describe('render <JsonViewer/> with props', () => {
  it('render with quotesOnKeys', () => {
    const selection = [true, false]
    selection.forEach(quotesOnKeys => {
      render(<JsonViewer value={full} quotesOnKeys={quotesOnKeys}/>)
    })
  })

  it('render with theme', () => {
    const selection = [
      'auto',
      'light',
      'dark',
      {
        scheme: 'Ocean',
        author: 'Chris Kempson (http://chriskempson.com)',
        base00: '#2b303b',
        base01: '#343d46',
        base02: '#4f5b66',
        base03: '#65737e',
        base04: '#a7adba',
        base05: '#c0c5ce',
        base06: '#dfe1e8',
        base07: '#eff1f5',
        base08: '#bf616a',
        base09: '#d08770',
        base0A: '#ebcb8b',
        base0B: '#a3be8c',
        base0C: '#96b5b4',
        base0D: '#8fa1b3',
        base0E: '#b48ead',
        base0F: '#ab7967'
      }
    ] as const
    selection.forEach(theme => {
      render(<JsonViewer value={full} theme={theme}/>)
    })
  })

  it('render with objectSortKeys', () => {
    const selection = [
      true,
      false,
      (a: string, b: string) => a.localeCompare(b)]
    selection.forEach(objectSortKeys => {
      render(<JsonViewer value={full} objectSortKeys={objectSortKeys}/>)
    })
  })

  it('render with rootName false', async () => {
    render(<JsonViewer value={undefined} rootName={false}/>)
    expect((await screen.findByTestId('data-key-pair')).innerText)
      .toEqual(undefined)
  })

  it('render with displayDataTypes', async () => {
    const selection = [true, false]
    selection.forEach(displayDataTypes => {
      render(<JsonViewer value={undefined} displayDataTypes={displayDataTypes}/>)
    })
  })

  it('render with displayObjectSize', async () => {
    const selection = [true, false]
    selection.forEach(displayObjectSize => {
      render(<JsonViewer value={['string1', 'string2']} displayObjectSize={displayObjectSize}/>)
    })
  })

  it('render with dataTypes', async () => {
    render(<JsonViewer value={undefined} valueTypes={[]}/>)
    render(<JsonViewer value={undefined} valueTypes={[
      {
        is: (value) => typeof value === 'string',
        serialize: (value) => `#${value}`,
        Component: (props) => {
          expectTypeOf(props.value).toBeUnknown()
          return null
        }
      },
      ({
        is: (value) => typeof value === 'string',
        serialize: (value) => `$${value}`,
        Component: (props) => {
          expectTypeOf(props.value).toMatchTypeOf<string>()
          return null
        }
      } satisfies DataType<string>)
    ]}/>)
  })
})

describe('Expand elements by click on dots', () => {
  it('render', () => {
    const { container, rerender } = render(
        <JsonViewer
            rootName={false}
            value={['string1', 'string2']}
            defaultInspectDepth={0}
        />
    )

    let elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(1)
    expect(elements[0].textContent).eq('…')
    fireEvent.click(elements[0])

    rerender(
        <JsonViewer
            rootName={false}
            value={['string1', 'string2']}
            defaultInspectDepth={0}
        />
    )
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)

    elements = container.getElementsByClassName('data-object')
    expect(elements.length).eq(1)
    expect(elements[0].children.length).eq(2)
  })
})

describe('test functions', () => {
  const func1 = function (...args: any[]) {
    console.log(args)
    return '111'
  }

  function func2 (...args: any[]) {
    console.log(args)
    return '222'
  }

  const dataProvider = [
    [
      function (...args: any) {
        console.log(args)
        return '333'
      },
      '(...args) {',
      `
        console.log(args);
        return "333";
      `
    ],
    [
      func1,
      '(...args) {',
      `
    console.log(args);
    return "111";
  `
    ],
    [
      func2,
      'func2(...args) {',
      `
    console.log(args);
    return "222";
  `
    ],
    [
      (..._: any) => console.log('555'),
      '(..._) => {',
      ' console.log("555")'
    ],
    [
      (...args: any) => {
        console.log(args)
        return '666'
      },
      '(...args) => {',
      ` {
        console.log(args);
        return "666";
      }`
    ],
    [
      // eslint-disable-next-line unused-imports/no-unused-vars
      function (_a: number, _b: number) {
        throw Error('Be careful to use the function just as value in useState() hook')
      },
      '(_a, _b) {',
      `
        throw Error("Be careful to use the function just as value in useState() hook");
      `
    ],
    [
      ({ prop1, prop2, ...other }: any) => {
        console.log(prop1, prop2, other)
        return '777'
      },
      '({ prop1, prop2, ...other }) => {',
      ` {
        console.log(prop1, prop2, other);
        return "777";
      }`
    ],
    [
      {
        func: ({ prop1, prop2, ...other }: any) => {
          console.log(prop1, prop2, other)
          return '888'
        }
      },
      '({ prop1, prop2, ...other }) => {',
      ` {
          console.log(prop1, prop2, other);
          return "888";
        }`
    ],
    [
      // @ts-ignore
      function (e, n) { return e + n },
      '(e, n) {',
      `
        return e + n;
      `
    ]
  ]
  for (const iteration of dataProvider) {
    it('render', () => {
      const { container } = render(
        <JsonViewer
          rootName={false}
          value={iteration[0]}
        />
      )
      expect(container.children.length).eq(1)
      const functionName = container.getElementsByClassName('data-function-start')
      expect(functionName.length).eq(1)
      expect(functionName[0].textContent).eq(iteration[1])

      const functionBody = container.getElementsByClassName('data-function')
      expect(functionBody.length).eq(1)
      expect(functionBody[0].textContent).eq(iteration[2])
    })
  }
})

describe('Expand function by click on dots', () => {
  it('render', () => {
    const { container, rerender } = render(
      <JsonViewer
        rootName={false}
        value={(_: any) => console.log('it works')}
        defaultInspectDepth={0}
      />
    )

    let elements = container.getElementsByClassName('data-function-body')
    expect(elements.length).eq(1)
    expect(elements[0].textContent).eq('…')
    fireEvent.click(elements[0])

    rerender(
      <JsonViewer
        rootName={false}
        value={(_: any) => console.log('it works')}
        defaultInspectDepth={0}
      />
    )
    elements = container.getElementsByClassName('data-function-body')
    expect(elements.length).eq(0)

    elements = container.getElementsByClassName('data-function')
    expect(elements.length).eq(1)
    expect(elements[0].children.length).eq(0)
    expect(elements[0].textContent).not.eq('…')
  })
})

describe('See empty iterables', () => {
  it('Array', () => {
    const { container } = render(
        <JsonViewer
            rootName={false}
            value={[]}
            defaultInspectDepth={0}
        />
    )

    let elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
    elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
  })
  it('Object', () => {
    const { container } = render(
        <JsonViewer
            rootName={false}
            value={{}}
            defaultInspectDepth={0}
        />
    )

    let elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
    elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
  })
  it('Map', () => {
    const { container } = render(
        <JsonViewer
            rootName={false}
            value={new Map()}
            defaultInspectDepth={0}
        />
    )

    let elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
    elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
  })
  it('Set', () => {
    const { container } = render(
        <JsonViewer
            rootName={false}
            value={new Set()}
            defaultInspectDepth={0}
        />
    )

    let elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
    elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
  })
})

describe('Click on empty iterables', () => {
  it('Array', () => {
    const Component = () => <JsonViewer
        rootName={false}
        value={[]}
        defaultInspectDepth={0}
    />
    const { container, rerender } = render(<Component />)

    // Click on start brace
    let elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)

    // Click on end brace
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
  })
  it('Object', () => {
    const Component = () => <JsonViewer
        rootName={false}
        value={[]}
        defaultInspectDepth={0}
    />
    const { container, rerender } = render(<Component />)

    // Click on start brace
    let elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)

    // Click on end brace
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
  })
  it('Map', () => {
    const Component = () => <JsonViewer
      rootName={false}
      value={new Map()}
      defaultInspectDepth={0}
  />
    const { container, rerender } = render(<Component />)

    // Click on start brace
    let elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)

    // Click on end brace
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
  })
  it('Set', () => {
    const Component = () => <JsonViewer
      rootName={false}
      value={new Set()}
      defaultInspectDepth={0}
  />
    const { container, rerender } = render(<Component />)

    // Click on start brace
    let elements = container.getElementsByClassName('data-object-start')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)

    // Click on end brace
    elements = container.getElementsByClassName('data-object-end')
    expect(elements.length).eq(1)
    fireEvent.click(elements[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('data-object-body')
    expect(elements.length).eq(0)
  })
})

describe('Show three dots after string collapsing', () => {
  it('render', () => {
    const Component = () => <JsonViewer
        rootName={false}
        value={'string string string'}
        collapseStringsAfterLength={6}
    />
    const { container, rerender } = render(<Component />)

    let elements = container.getElementsByClassName('string-value')
    expect(elements.length).eq(1)
    expect(elements[0].children.length).eq(1)
    expect(elements[0].textContent).eq('"string…"')
    fireEvent.click(elements[0].children[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('string-value')
    expect(elements.length).eq(1)
    expect(elements[0].children.length).eq(1)
    expect(elements[0].textContent).eq('"string string string"')
    fireEvent.click(elements[0].children[0])

    rerender(<Component />)
    elements = container.getElementsByClassName('string-value')
    expect(elements.length).eq(1)
    expect(elements[0].children.length).eq(1)
    expect(elements[0].textContent).eq('"string…"')
  })
})
