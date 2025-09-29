import chalk from 'chalk';
import { exec } from 'child_process';
import ora from 'ora';
import inquirer from 'inquirer';

await main();

async function executarComandos(executar) {
  for (const item of executar) {
    await execShellCommand(item);
  }
}

function execShellCommand(cmd) {
  const spinner = ora(cmd).start();
  return new Promise((resolve, reject) => {
    const process = exec(cmd);
    process.on('exit', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green(`${cmd}`));
        resolve();
      } else {
        spinner.fail(chalk.red(`Comando falhou com código ${code}: ${cmd}`));
        reject(code);
      }
    });
  });
}

async function verificarAlteracoesPendentes() {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', (error, stdout) => {
      if (error) {
        reject(`Erro ao verificar alterações pendentes: ${error}`);
      }
      if (stdout.trim()) {
        reject('Há alterações pendentes no Git. Por favor, faça o commit ou stash antes de continuar.');
      } else {
        resolve();
      }
    });
  });
}

async function fazerCheckoutBranch(ambiente) {
  const getCurrentBranch = () => {
    return new Promise((resolve, reject) => {
      exec('git rev-parse --abbrev-ref HEAD', (error, stdout) => {
        if (error) {
          reject(`Erro ao obter branch atual: ${error}`);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  };

  // Para HOMOLOGACAO_DEV e HOMOLOGACAO, branch develop. Para PRODUCAO, branch master.
  let branch = ambiente === 'PRODUCAO' ? 'master' : 'develop';

  if (ambiente === 'HOMOLOGACAO' || ambiente === 'HOMOLOGACAO_DEV') {
    const currentBranch = await getCurrentBranch();
    if (currentBranch !== 'develop') {
      const answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'switchBranch',
        message: `Você está na branch '${currentBranch}'. Deseja trocar para 'develop' para o build?`,
        default: true
      }]);
      if (!answer.switchBranch) {
        branch = currentBranch;
      }
    }
  }

  await execShellCommand(`git checkout ${branch}`);
}

async function main() {
  try {
    // await verificarAlteracoesPendentes();
  } catch (error) {
    console.error(chalk.red(error));
    return;
  }

  const { environments } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'environments',
    message: 'Escolha o(s) ambiente(s) para deploy:',
    choices: [
      { name: 'HOMOLOGACAO', value: 'HOMOLOGACAO' },
      { name: 'HOMOLOGACAO_DEV', value: 'HOMOLOGACAO_DEV' },
      { name: 'PRODUCAO', value: 'PRODUCAO' }
    ]
  }]);

  const configs = {
    HOMOLOGACAO: {
      baseHref: '/solicitar/',
      deployUrl: '/solicitar/',
      remotePath: '/home/graxaveia/domains/sistemaspleno-homolog.com/public_html/solicitar',
      userSsh: 'graxaveia@172.17.33.88',
      configuration: 'production'
    },
    HOMOLOGACAO_DEV: {
      baseHref: '/solicitar/',
      deployUrl: '/solicitar/',
      remotePath: '/home/graxaveia/domains/sistemaspleno-dev.com/public_html/solicitar',
      userSsh: 'graxaveia@172.17.33.88',
      configuration: 'production'
    },
    PRODUCAO: {
      baseHref: '/solicitar/',
      deployUrl: '/solicitar/',
      remotePath: '/home/graxaveia/domains/sistemaspleno.com/public_html/solicitar',
      userSsh: 'graxaveia@172.17.33.88',
      configuration: 'production'
    }
  };

  for (const env of environments) {
    try {
      // Fazer checkout da branch correta
      await fazerCheckoutBranch(env);

      console.log(chalk.blue(`Iniciando processo de build para o ambiente ${env}...`));

      // Configuração do ambiente selecionado
      const config = configs[env];
      const buildCommands = [
        `rm -rf dist/frontend-solicitacoes`,
        `ng build --base-href ${config.baseHref} --deploy-url ${config.deployUrl} --configuration ${config.configuration}`,
        `cp .htaccess dist/frontend-solicitacoes`,
        `cd dist/frontend-solicitacoes; zip -rq upload.zip * .[^.]*`
      ];

      // Realizar build
      await executarComandos(buildCommands);

      console.log(chalk.blue(`Realizando deploy para o ambiente ${env}...`));

      // Comandos de deploy
      const deployCommands = [
        `rsync --progress -avz dist/frontend-solicitacoes/upload.zip ${config.userSsh}:${config.remotePath}`,
        `ssh ${config.userSsh} "cd ${config.remotePath} && rm -rf *.txt assets/ *.ico *.html *.js *.woff *.woff2 *.ttf *.eot *.css *.png; unzip -oq upload.zip; rm upload.zip"`
      ];

      await executarComandos(deployCommands);
      console.log(chalk.green(`Deploy para ${env} concluído com sucesso!`));
    } catch (error) {
      console.error(chalk.red(`Erro durante o processo no ambiente ${env}: ${error}`));
    }
  }

  console.log(chalk.green('Todos os processos de build e deploy foram concluídos com sucesso!'));
}