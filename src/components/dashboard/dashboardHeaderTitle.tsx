'use client'

import Image from 'next/image'
import { dashboardHeaderTitle } from './dashboardHeaderTitle.styles'

const styles = dashboardHeaderTitle()

export function DashboardHeaderTitle() {
  return (
    <h1 className={styles.heading()}>
      <Image
        src="/icon.svg"
        alt=""
        width={40}
        height={40}
        className="shrink-0"
      />
      <span>Pukapuka</span>
      <span>Space</span>
    </h1>
  )
}
