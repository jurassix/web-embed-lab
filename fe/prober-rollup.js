import cleanup from 'rollup-plugin-cleanup'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

const production = !process.env.ROLLUP_WATCH;

export default {
  input: './src/prober/prober.js',
  output: {
    file: './dist/prober/prober.js',
    format: 'es'
  },
  plugins: [
    commonjs(),
    resolve(),
    cleanup({
      comments: 'none'
    })
  ]
}
