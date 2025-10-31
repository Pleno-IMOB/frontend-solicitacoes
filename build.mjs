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

  const endpoints = ['solicitar', 'buscar'];

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
    // Fazer checkout da branch correta
    await fazerCheckoutBranch(env);

    for (const endpoint of endpoints) {
      try {
        const folderBuild = `dist/${endpoint}`;

        console.log(chalk.blue(`\n🚀 Iniciando build do endpoint "${endpoint}" para ${env}...`));

        // Configuração do ambiente selecionado
        const config = configs[env];
        const buildCommands = [
          `rm -rf dist`,
          `ng build --base-href /${endpoint}/ --deploy-url /${endpoint}/ --configuration ${config.configuration} --output-path=${folderBuild}`,
          `cp .htaccess ${folderBuild}`,
          `cd ${folderBuild}; zip -rq upload.zip * .[^.]*`
        ];

        // Realizar build
        await executarComandos(buildCommands);

        // Comandos de deploy
        console.log(chalk.blue(`Realizando deploy para o ambiente ${env}...`));
        const deployCommands = [
          `rsync --progress -avz ${folderBuild}/upload.zip ${config.userSsh}:${config.remotePath.replace('solicitar', endpoint)}`,
          `ssh ${config.userSsh} "cd ${config.remotePath.replace('solicitar', endpoint)} && rm -rf *.txt assets/ *.ico *.html *.js *.woff *.woff2 *.ttf *.eot *.css *.png; unzip -oq upload.zip; rm upload.zip"`
        ];

        await executarComandos(deployCommands);
        console.log(chalk.green(`✅ Deploy do endpoint "${endpoint}" para ${env} concluído com sucesso!`));
      } catch (error) {
        console.error(chalk.red(`Erro durante o processo no endpoint "${endpoint}" no ambiente ${env}: ${error}`));
      }
    }
  }

  await executarComandos([`rm -rf dist/ .angular/`]);
  console.log(chalk.green('Todos os processos de build e deploy foram concluídos com sucesso!'));
}