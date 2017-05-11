var minimist = require('minimist')

module.exports = function container (get, set, clear) {
  var c = get('conf')
  return function (program) {
    program
      .command('sell [selector]')
      .allowUnknownOption()
      .description('execute a sell order to the exchange')
      .option('--sell_pct <pct>', 'sell with this % of currency balance', Number, c.sell_pct)
      .option('--markup_pct <pct>', '% to mark up ask price', Number, c.markup_pct)
      .option('--order_adjust_time <ms>', 'adjust bid on this interval to keep order competitive', Number, c.order_adjust_time)
      .option('--max_slippage_pct <pct>', 'avoid selling at a slippage pct above this float', c.max_slippage_pct)
      .action(function (selector, cmd) {
        var s = {options: minimist(process.argv)}
        var so = s.options
        delete so._
        Object.keys(c).forEach(function (k) {
          if (typeof cmd[k] !== 'undefined') {
            so[k] = cmd[k]
          }
        })
        so.selector = get('lib.normalize-selector')(selector || c.selector)
        so.mode = 'live'
        so.strategy = c.strategy
        var engine = get('lib.engine')(s)
        engine.executeSignal('sell', function (err, order) {
          if (err) {
            if (err.desc) {
              console.error(err.desc)
              process.exit(1)
            }
            else throw err
          }
          console.log(JSON.stringify(order, null, 2))
          process.exit()
        })
      })
  }
}