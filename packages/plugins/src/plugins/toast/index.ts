import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export function toast(
  message: string,
  type: ToastType = 'success',
  duration?: number,
) {
  // icon/type 为构造级透传（notyf 类型未声明，运行时惰性），按运行时形态断言
  const notyf = new Notyf({
    position: { x: 'right', y: 'top' },
    icon: false,
    duration: 2500,
    dismissible: true,
    type: 'success',
    types: [
      {
        type: 'info',
        background: 'rgba(0,0,0,0.7)',
        icon: false,
      },
      {
        type: 'warning',
        background: 'orange',
        icon: {
          className: 'material-icons',
          tagName: 'i',
          text: 'warning',
        },
      },
      {
        type: 'error',
        background: 'indianred',
        duration: 2000,
        dismissible: true,
      },
    ],
  } as unknown as ConstructorParameters<typeof Notyf>[0])

  if (type === 'info') {
    notyf.open({
      type,
      message,
      duration,
      icon: false,
    })
  } else {
    // notyf 类型声明仅含 success/error；info/warning 为构造函数按 types 配置
    // 动态注册的方法，运行时存在，此处按运行时形态断言
    const method = (
      notyf as unknown as Record<ToastType, (payload: NotyfPayload) => unknown>
    )[type]
    method({
      message,
      duration,
      icon: false,
    })
  }
}

interface NotyfPayload {
  message: string
  duration?: number
  icon: false
}
