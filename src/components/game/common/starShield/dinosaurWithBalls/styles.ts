import { tv } from 'tailwind-variants'

export const dinosaurWithBalls = tv({
  slots: {
    dinoWrapper: [
      'absolute z-10 pointer-events-none',
      '[left:var(--dino-left)] [bottom:var(--dino-bottom)] [transform:var(--dino-transform)]',
    ],
    ballsWrapper: [
      'absolute z-[9] pointer-events-none',
      '[left:var(--dino-left)] [bottom:var(--dino-bottom)] translate-x-[-50%] translate-y-[50%]',
    ],
    ball: [
      'absolute left-0 top-0 rounded-full',
      '[width:var(--ball-size)] [height:var(--ball-size)] [background-color:var(--ball-color)] [box-shadow:var(--ball-shadow)]',
    ],
  },
})
