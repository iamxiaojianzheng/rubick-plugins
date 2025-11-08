const os = require('os');
const { exec } = require('./sudoPrompt');

const cmd = (cmdStr) => {
  return new Promise((resolve, reject) => {
    exec(cmdStr, (error, stdout, stderr) => {
      if (error) {
        reject({ error, data: stdout });
      } else if (stderr) {
        reject({ error: stderr, data: stdout });
      } else {
        resolve({ data: stdout });
      }
    });
  });
};

const prefix = 'netsh interface ip set';

window.netshSetAddress = (name, address, netmask, gateway = 'none', dns = 'none') => {
  const gwmetric = gateway !== 'none' ? 1 : '';
  const a = `${prefix} address name="${name}" static ${address} ${netmask} ${gateway} ${gwmetric}`;
  const b = `${prefix} dns name="${name}" static ${dns}`;
  return cmd(`${a} && ${b}`);
};

window.netshSetAddressDhcp = (name) => {
  const a = `${prefix} address name="${name}" source=dhcp`;
  const b = `${prefix} dns name="${name}" source=dhcp`;
  return cmd(`${a} && ${b}`);
};

window.netshShowAddress = () => cmd('netsh interface ip show address');

window.networkInterfaces = () => os.networkInterfaces();
