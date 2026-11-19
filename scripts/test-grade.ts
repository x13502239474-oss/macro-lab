import { grade, norm } from '../src/lib/grade'
import type { Q } from '../src/lib/types'

let pass = 0
let fail = 0
function check(name: string, cond: boolean) {
  if (cond) pass++
  else {
    fail++
    console.error('FAIL:', name)
  }
}

const single: Q = { id: 't1', type: 'single', stem: '', options: ['A. 甲', 'B. 乙', 'C. 丙', 'D. 丁'], answer: 'C', ex: '' }
check('单选 正确', grade(single, 'C').ok)
check('单选 小写', grade(single, 'c').ok)
check('单选 错误', !grade(single, 'A').ok)
check('单选 空', !grade(single, '').ok)

const judge: Q = { id: 't2', type: 'judge', stem: '', answer: '对', ex: '' }
check('判断 对', grade(judge, '对').ok)
check('判断 正确', grade(judge, '正确').ok)
check('判断 √', grade(judge, '√').ok)
check('判断 true', grade(judge, 'true').ok)
check('判断 错', !grade(judge, '错').ok)

const j2: Q = { id: 't3', type: 'judge', stem: '', answer: '错', ex: '' }
check('判断错 正确', grade(j2, '×').ok)
check('判断错 错误', !grade(j2, '对').ok)

const fill: Q = { id: 't4', type: 'fill', stem: '', answer: 'GDP', accepted: ['国内生产总值', 'gross domestic product'], ex: '' }
check('填空 原文', grade(fill, 'GDP').ok)
check('填空 中文', grade(fill, '国内生产总值').ok)
check('填空 全角', grade(fill, 'ＧＤＰ').ok)
check('填空 空格', grade(fill, ' gdp ').ok)
check('填空 错误', !grade(fill, 'GNP').ok)

const num: Q = { id: 't5', type: 'fill', stem: '', answer: '5.2', ex: '' }
check('数值 相等', grade(num, '5.2').ok)
check('数值 百分号', grade(num, '5.2%').ok)
check('数值 容差', grade(num, '5.21').ok)
check('数值 错误', !grade(num, '5.5').ok)

const short: Q = {
  id: 't6',
  type: 'short',
  stem: '',
  answer: '',
  keywords: ['规模|GDP总量', '人均|人均GDP', '分配|收入差距', '福利|环境|闲暇'],
  ex: '',
}
check('简答 全覆盖', grade(short, 'GDP 总量大，但人均低，分配不均，也没算环境和闲暇').ok)
check('简答 3/4 命中', grade(short, 'GDP总量很大，人均水平低，分配也不均').ok)
check('简答 2/4 不足', !grade(short, '总量很大，人均水平低').ok)
check('简答 未作答', !grade(short, '   ').ok)

check('归一化 全角', norm('ＧＤＰ　５．２％') === 'gdp5.2')
check('归一化 标点', norm('实际 GDP，增长 5.2%。') === '实际gdp增长5.2')

console.log(`判分测试：通过 ${pass}，失败 ${fail}`)
if (fail) process.exit(1)
