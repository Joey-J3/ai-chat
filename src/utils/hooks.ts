import { CSSProperties, useEffect, useState } from 'react'

export function useIsClient() {
  const [isClient, setClient] = useState(false)

  useEffect(() => {
    setClient(true)
  }, [])

  return isClient
}

export function useVisibilityInClient(): CSSProperties {
  const isClient = useIsClient()
  return { visibility: isClient ?  'visible' : 'hidden' }
}


/**
 * 计算1 - 100 质数和
 */
function sum() {
  let res = 0
  let count = 0;
  let i = 1
  while(count <= 100) {
    // 1. 判断是否是质数
    if (isDummyNum(i)) {
      res += i
      count++;
    }
    i++;
  }
  return res
}

/**
 * 判断是否是质数
 */
const isDummyNum = (num: number) => {
  for (let i = 2; i < num; i++) {
    if (num % i === 0) {
      return false
    }
  }
  return true;
}