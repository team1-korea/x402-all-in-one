const ROOT = __dirname

module.exports = {
  apps: [
    {
      name: 'facilitator',
      script: 'npm',
      args: 'run start',
      cwd: `${ROOT}/x402-facilitator`,
      out_file: `${ROOT}/logs/facilitator.out.log`,
      error_file: `${ROOT}/logs/facilitator.err.log`,
      time: true,
      restart_delay: 3000,
    },
    {
      name: 'server',
      script: 'npm',
      args: 'run start',
      cwd: `${ROOT}/x402-server`,
      out_file: `${ROOT}/logs/server.out.log`,
      error_file: `${ROOT}/logs/server.err.log`,
      time: true,
      restart_delay: 3000,
    },
    {
      name: 'quests',
      script: 'npm',
      args: 'run preview',
      cwd: `${ROOT}/x402-quests`,
      out_file: `${ROOT}/logs/quests.out.log`,
      error_file: `${ROOT}/logs/quests.err.log`,
      time: true,
    },
    {
      name: 'lecture',
      script: 'npm',
      args: 'run preview',
      cwd: `${ROOT}/lecture`,
      out_file: `${ROOT}/logs/lecture.out.log`,
      error_file: `${ROOT}/logs/lecture.err.log`,
      time: true,
    },
  ],
}
