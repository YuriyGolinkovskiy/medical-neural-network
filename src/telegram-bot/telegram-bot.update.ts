import { Update, Ctx, Start, Help, On, Action, Hears } from 'nestjs-telegraf';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Context, Markup, Scenes, Telegraf } from 'telegraf';
import { callback } from 'telegraf/typings/button';
import { TelegramBotService } from './telegram-bot.service';
import { commands } from './telegram-bot.static';

enum Status {
    Login = 'login',
    Password = 'password',
    Password_Login = 'password_login',
    Login_Login = 'login_login',
    User_Id = 'user_id',
    User_Log = 'user_log',
    User_remove = 'user_remove',
    User_addRole = 'user_addRole',
    User_valueRole = 'user_valueRole',
    User_removeRole = 'user_removeRole',
    User_removeValueRole = 'user_removeValueRole',
    Roles_value = 'roles_value',
    Roles_remove = 'roles_remove',
    Roles_create = 'roles_create',
    Network_CreateDateset = 'network_createDataset',
    Network_DeleteDateset = 'network_deleteDataset',
    Network_DeleteModel = 'network_deleteModel',
    Network_Train = 'network_train',
    Network_TrainEpochs = 'network_trainEpochs',
    Network_TrainBatchSize = 'Network_TrainBatchSize',
    Network_TrainModelSaveName = 'Network_TrainModelSaveName',
    Network_AddFiles = 'network_addFiles',
    Network_InputFiles = 'network_inputFiles',
    Network_IsTarget = 'network_isTarget',
    Network_DeleteFiles = 'network_deleteFiles',
    Network_DeleteFileNames = 'network_deleteFileNames',
    Network_Predict = 'network_predict',
    Network_LoadFiles = 'network_loadFiles',
    Network_Results = 'network_results',
    None = '',
}
export interface SessionData {
    login: string;
    password: string;
    id: string;
    log: string;
    addRole: string;
    roleValue: string;
    roleDescription: string;
    token: string;
    tokenDate: Date;
    role: string;
    status: string;
    datasetName: string;
    modelName: string;
    networkEpochs: string;
    networkBatchSize: string;
    networkSaveModelName: string;
    networkFiles: any[];
    networkIsTrain: string;
    networkIsTarget: string;
    isMany: boolean;
}
export interface MyContext extends Context {
    session?: SessionData;
}
@Update()
export class TelegramBotUpdate {
    jwtService: any;
    constructor(private readonly telegramBotService: TelegramBotService) {}

    private registration_login_keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Регистрация', 'registration_btn'),
            Markup.button.callback('Авторизация', 'login_btn'),
        ],
    ]);

    private registration_login_ok_keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Да', 'registration_login_ok'),
            Markup.button.callback('Нет', 'registration_login_no'),
        ],
        [Markup.button.callback('Назад', 'registration_back')],
    ]);

    private login_back = Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'registration_back'),
    ]);

    private main_keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Работа с нейросетью', 'main_network')],
        [
            Markup.button.callback('Управление пользователями', 'main_users'),
            Markup.button.callback('Управление ролями', 'main_roles'),
        ],
        [Markup.button.callback('Выйти с аккаунта', 'logout')],
    ]);

    private users_keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Получить всех пользователей', 'users_getAll')],
        [
            Markup.button.callback(
                'Пользователь по логину',
                'users_getByLogin'
            ),
            Markup.button.callback(
                'Удалить пользователя по id',
                'users_remove'
            ),
        ],
        [
            Markup.button.callback('Выдать пользователю роль', 'users_addRole'),
            Markup.button.callback(
                'Забрать роль у пользователя',
                'users_removeRole'
            ),
        ],
        [Markup.button.callback('Назад', 'main_back')],
    ]);

    private roles_keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Получить все роли', 'roles_getAll')],
        [
            Markup.button.callback('Создать новую роль', 'roles_create'),
            Markup.button.callback('Удалить существующую роль', 'roles_remove'),
        ],
        [Markup.button.callback('Назад', 'main_back')],
    ]);

    private network_keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Предсказать результат', 'network_predict')],

        [
            Markup.button.callback('Получить модели', 'network_getModels'),
            Markup.button.callback('Удалить модель', 'network_deleteModel'),
        ],
        [
            Markup.button.callback('Создать датасет', 'network_createDataset'),
            Markup.button.callback('Все датасеты', 'network_getDatasets'),
            Markup.button.callback('Удалить датасет', 'network_deleteDataset'),
        ],
        [
            Markup.button.callback(
                'Добавить файлы в датасет',
                'network_addFiles'
            ),
            Markup.button.callback(
                'Удалить файлы из датасета',
                'network_deleteFiles'
            ),
        ],
        [Markup.button.callback('Тренировать сеть', 'network_train')],
        [Markup.button.callback('Назад', 'main_back')],
    ]);

    private networkIsTrainData_keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback(
                'Набору для обучения',
                'network_isTrainTrue'
            ),
            Markup.button.callback(
                'Набору для тестирования',
                'network_isTrainFalse'
            ),
        ],
    ]);

    private networkIsTarget_keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Да', 'network_isTargetTrue'),
            Markup.button.callback('Нет', 'network_isTargetFalse'),
        ],
    ]);

    private networkIsTrainDelete_keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Да', 'network_deleteIsTrainTrue'),
            Markup.button.callback('Нет', 'network_deleteIsTrainFalse'),
        ],
    ]);
    // checkAuth(@Ctx() ctx: MyContext): boolean {
    //     const dateNow = new Date();
    //     const dateToken = ctx.session.tokenDate;
    //     const day = 1000 * 60 * 60 * 24;
    //     if (
    //         ctx.session.token &&
    //         dateNow.getTime() - dateToken.getTime() < day
    //     ) {
    //         return true;
    //     }
    //     return false;
    // }
    auth(@Ctx() ctx: MyContext) {
        if (!ctx.session.token) {
            ctx.replyWithHTML(
                'Вы не авторизированы, если у вас нет аккаунта, зарегистрируйтесь',
                this.registration_login_keyboard
            );
            return false;
        } else {
            return true;
        }
    }
    @Start()
    async start(@Ctx() ctx: MyContext) {
        await ctx.reply(
            `Привет ${
                ctx.message.from.first_name
                    ? ctx.message.from.first_name
                    : 'незнакомец'
            } ${ctx.message.from.last_name ? ctx.message.from.last_name : ''}!`
        );
        if (this.auth(ctx)) {
            await ctx.reply(
                `Вы вошли как ${ctx.session.login}. Ваши права доступа ${ctx.session.role}`,
                this.main_keyboard
            );
        }
    }

    @Help()
    async help(@Ctx() ctx: MyContext) {
        await ctx.reply(commands);
    }

    @On('message')
    async on(@Ctx() ctx: MyContext) {
        if (ctx.session.status == Status.Login) {
            const message: any = ctx.message;
            ctx.session.login = message.text;
            ctx.session.status = Status.Password;
            await ctx.reply('Введите пароль');
            return;
        }
        if (ctx.session.status == Status.Login_Login) {
            const message: any = ctx.message;
            ctx.session.login = message.text;
            ctx.session.status = Status.Password_Login;
            await ctx.reply('Введите пароль');
            return;
        }
        if (ctx.session.status == Status.Password) {
            const message: any = ctx.message;
            ctx.session.password = message.text;
            ctx.session.status = Status.None;
            const createUserDto: CreateUserDto = {
                login: ctx.session.login,
                password: ctx.session.password,
                telegramId: ctx.from.id,
            };
            try {
                await this.telegramBotService
                    .registration(createUserDto)
                    .forEach(async (element) => {
                        ctx.session.token = element.data.token;
                        ctx.session.tokenDate = new Date();
                        await ctx.reply(
                            'Вы успешно зарегистрировались',
                            this.main_keyboard
                        );
                    });
            } catch (error) {
                await ctx.reply(
                    'Пользователь с таким логином существует, попробуйте заново'
                );
                await ctx.replyWithHTML(
                    'Вы хотите использовать логин телеграмма в качестве логина регистрации?',
                    this.registration_login_ok_keyboard
                );
            }

            return;
        }
        if (ctx.session.status == Status.Password_Login) {
            const message: any = ctx.message;
            ctx.session.password = message.text;
            ctx.session.status = Status.None;
            const createUserDto: CreateUserDto = {
                login: ctx.session.login,
                password: ctx.session.password,
            };
            try {
                await this.telegramBotService
                    .login(createUserDto)
                    .forEach(async (element) => {
                        ctx.session.token = element.data.token;
                        ctx.session.tokenDate = new Date();
                        await this.telegramBotService
                            .getUser(ctx.session.login)
                            .forEach(async (el) => {
                                ctx.session.role = el.data.roles.pop();
                            });
                        await ctx.reply(
                            `Авторизация прошла успешно, ваша роль ${ctx.session.role}`,
                            this.main_keyboard
                        );
                    });
            } catch (error) {
                await ctx.reply(
                    'Пользователя с такими данными не существует, повторите попытку либо вернитесь назад',
                    this.login_back
                );
                ctx.session.status = Status.Login_Login;
                await ctx.reply('Введите логин');
            }

            return;
        }
        if (ctx.session.status == Status.User_Log) {
            const message: any = ctx.message;
            ctx.session.log = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .getUserByLogin(ctx.session)
                    .forEach(async (element) => {
                        if (element.data) {
                            await ctx.reply(
                                `Пользователь\nid:${element.data._id}\nlogin:${element.data.login}\nroles:${element.data.roles}\ntelegramId:${element.data.telegramId}\n`
                            );
                        } else {
                            await ctx.reply(
                                `Такого пользователя не существует, повторите попытку`
                            );
                        }
                        await ctx.replyWithHTML(
                            '<b>Панель управления пользователями</b>',
                            this.users_keyboard
                        );
                    });
            } catch (error) {
                await ctx.reply(
                    'Ошибка,недостаточно прав. Повторите попытку',
                    this.users_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.User_remove) {
            const message: any = ctx.message;
            ctx.session.id = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .removeUser(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Пользователь ${element.data} удален`
                        );
                        await ctx.replyWithHTML(
                            '<b>Панель управления пользователями</b>',
                            this.users_keyboard
                        );
                    });
            } catch (error) {
                await ctx.reply(
                    'Невозможно удалить пользователя. Повторите попытку',
                    this.users_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.User_addRole) {
            const message: any = ctx.message;
            ctx.session.id = message.text;
            ctx.session.status = Status.User_valueRole;
            await ctx.replyWithHTML(
                `Введите роль, которую хотите дать пользователю`
            );
            return;
        }

        if (ctx.session.status == Status.User_removeRole) {
            const message: any = ctx.message;
            ctx.session.id = message.text;
            ctx.session.status = Status.User_removeValueRole;
            await ctx.replyWithHTML(
                `Введите роль, которую хотите забрать у пользователя`
            );
            return;
        }

        if (ctx.session.status == Status.User_valueRole) {
            const message: any = ctx.message;
            ctx.session.addRole = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .addRole(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Роль ${ctx.session.addRole} добавлена пользователю`
                        );
                        await ctx.replyWithHTML(
                            '<b>Панель управления пользователями</b>',
                            this.users_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.users_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.User_removeValueRole) {
            const message: any = ctx.message;
            ctx.session.addRole = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .removeRole(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Роль ${ctx.session.addRole} была забрана у пользователя`
                        );
                        await ctx.replyWithHTML(
                            '<b>Панель управления пользователями</b>',
                            this.users_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.users_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.Roles_value) {
            const message: any = ctx.message;
            ctx.session.roleValue = message.text;
            ctx.session.status = Status.Roles_create;
            await ctx.replyWithHTML(`Введите описание роли`);
            return;
        }

        if (ctx.session.status == Status.Roles_create) {
            const message: any = ctx.message;
            ctx.session.roleDescription = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .createRole(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Роль ${ctx.session.roleValue} была создана`
                        );
                        await ctx.replyWithHTML(
                            '<b>Панель управления ролями</b>',
                            this.roles_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `Такая роль существует. Повторите попытку`,
                    this.roles_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.Roles_remove) {
            const message: any = ctx.message;
            ctx.session.roleValue = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .deleteRole(ctx.session)
                    .forEach(async (element) => {
                        if (element.data) {
                            await ctx.replyWithHTML(
                                `Роль ${ctx.session.roleValue} была удалена`
                            );
                        } else {
                            await ctx.replyWithHTML(`Такой роли не существует`);
                        }

                        await ctx.replyWithHTML(
                            '<b>Панель управления ролями</b>',
                            this.roles_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.roles_keyboard
                );
            }
            return;
        }

        ///network
        if (ctx.session.status == Status.Network_CreateDateset) {
            const message: any = ctx.message;
            ctx.session.datasetName = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .createDataset(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Датасет ${ctx.session.datasetName} был создан`
                        );
                        await ctx.replyWithHTML(
                            '<b>Панель управления нейросетью</b>',
                            this.network_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.network_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.Network_DeleteDateset) {
            const message: any = ctx.message;
            ctx.session.datasetName = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .deleteDataset(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Датасет ${ctx.session.datasetName} был удален`
                        );

                        await ctx.replyWithHTML(
                            '<b>Панель управления нейросетью</b>',
                            this.network_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.network_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.Network_DeleteModel) {
            const message: any = ctx.message;
            ctx.session.modelName = message.text;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .deleteModel(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Модель ${ctx.session.modelName} была удалена`
                        );

                        await ctx.replyWithHTML(
                            '<b>Панель управления нейросетью</b>',
                            this.network_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.network_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.Network_Train) {
            const message: any = ctx.message;
            ctx.session.datasetName = message.text;
            ctx.session.status = Status.Network_TrainEpochs;
            await ctx.replyWithHTML(
                `Введите количество эпох для обучения.(По уполчанию 10)`
            );
            return;
        }

        if (ctx.session.status == Status.Network_TrainEpochs) {
            const message: any = ctx.message;
            ctx.session.networkEpochs = message.text;
            ctx.session.status = Status.Network_TrainBatchSize;
            await ctx.replyWithHTML(
                `Введите размер пакета обучения за цикл(batchSize). (По умолчанию 32)`
            );
            return;
        }

        if (ctx.session.status == Status.Network_TrainBatchSize) {
            const message: any = ctx.message;
            ctx.session.networkBatchSize = message.text;
            ctx.session.status = Status.Network_TrainModelSaveName;
            await ctx.replyWithHTML(
                `Введите наименование, под которым сохранится обученная модель`
            );
            return;
        }

        if (ctx.session.status == Status.Network_TrainModelSaveName) {
            const message: any = ctx.message;
            ctx.session.networkSaveModelName = message.text;
            ctx.session.status = Status.None;
            try {
                await ctx.replyWithHTML(
                    'Модель в процессе обучения, ожидайте, это может занять длительное время'
                );
                await this.telegramBotService
                    .trainNetwork(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML(
                            `Модель ${ctx.session.networkSaveModelName} была обучена`
                        );

                        await ctx.replyWithHTML(
                            '<b>Панель управления нейросетью</b>',
                            this.network_keyboard
                        );
                    });
            } catch (error) {
                console.log(error);
                await ctx.reply(
                    `Произошла ошибка, данные были указаны неправильно. Повторите попытку`,
                    this.network_keyboard
                );
            }
            return;
        }

        if (ctx.session.status == Status.Network_AddFiles) {
            const message: any = ctx.message;
            ctx.session.datasetName = message.text;
            ctx.session.status = Status.Network_InputFiles;
            ctx.session.networkFiles = new Array();
            ctx.session.isMany = false;
            await ctx.replyWithHTML(
                `Прикрепите изображения, которые хотите добавить в датасет(не сжимайте и сгруппируйте их)`
            );
            return;
        }

        if (ctx.session.status == Status.Network_InputFiles) {
            const message: any = ctx.message;
            if (!ctx.session.isMany) {
                ctx.replyWithHTML(
                    `Эти изображения будут относиться к:`,
                    this.networkIsTrainData_keyboard
                );
                ctx.session.isMany = true;
            }

            let link = (
                await ctx.telegram.getFileLink(message.document.file_id)
            ).href;
            await this.telegramBotService
                .getTgFileAsBuffer(link)
                .forEach((element) => {
                    ctx.session.networkFiles.push(element.data);
                });
            ctx.session.status = Status.None;

            return;
        }

        if (ctx.session.status == Status.Network_IsTarget) {
            const message: any = ctx.message;
            ctx.session.status = Status.None;

            await ctx.replyWithHTML(
                `Эти изображения будут относиться к:`,
                this.networkIsTrainData_keyboard
            );
            return;
        }

        if (ctx.session.status == Status.Network_DeleteFiles) {
            const message: any = ctx.message;
            ctx.session.datasetName = message.text;
            ctx.session.status = Status.None;
            await ctx.replyWithHTML(
                `Вы хотите удалить файлы для обучения?`,
                this.networkIsTrainDelete_keyboard
            );
            return;
        }

        if (ctx.session.status == Status.Network_DeleteFileNames) {
            const message: any = ctx.message;
            const files = message.text.split(',');
            ctx.session.networkFiles = files;
            ctx.session.status = Status.None;
            try {
                await this.telegramBotService
                    .deleteFiles(ctx.session)
                    .forEach(async (element) => {
                        await ctx.replyWithHTML('Файлы удалены');
                    });
            } catch (error) {
                console.log(error);
            }
            return;
        }

        if (ctx.session.status == Status.Network_Predict) {
            const message: any = ctx.message;
            ctx.session.modelName = message.text;
            ctx.session.status = Status.None;
            let results = '';
            try {
                await this.telegramBotService
                    .getPredict(ctx.session)
                    .forEach((element) => {
                        element.data.reverse().forEach((predict) => {
                            results += `\n  Изображение\n    Пневмония с вероятностью: ${
                                predict.Pneumonia * 100
                            }%\n    Нет пневмонии с вероятностью: ${
                                predict.Normal * 100
                            }%`;
                        });
                    });
                await ctx.replyWithHTML(
                    `Результаты предсказания:${results}`,
                    this.network_keyboard
                );
            } catch (error) {
                console.log(error);
            }
            return;
        }

        if (ctx.session.status == Status.Network_LoadFiles) {
            const message: any = ctx.message;
            if (!ctx.session.isMany) {
                ctx.session.isMany = true;
                try {
                    let models = '';
                    await this.telegramBotService
                        .getModels()
                        .forEach((element) => {
                            element.data.forEach(async (model) => {
                                models += `\n-- ${model}`;
                            });
                        });
                    await ctx.reply(`Доступные обученные модели:${models}`);
                    await ctx.reply('Введите название модели для предсказания');
                } catch (error) {
                    await ctx.reply(
                        `${error.response.data.message}. Повторите попытку`,
                        this.network_keyboard
                    );
                }
            }

            let link = (
                await ctx.telegram.getFileLink(message.document.file_id)
            ).href;

            await this.telegramBotService
                .getTgFileAsBuffer(link)
                .forEach((element) => {
                    ctx.session.networkFiles.push(element.data);
                });
            ctx.session.status = Status.Network_Predict;

            return;
        }

        if (ctx.session.status == Status.None) {
            //await ctx.reply(`${ctx.session.login}  ${ctx.session.password}`);
            //console.log(ctx.session.networkFiles);
            return;
        }
    }

    @Action('registration_login_ok')
    async registration_login_ok(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (ctx.from.username) {
            let log = ctx.from.username;
            ctx.session.login = log;
            await ctx.reply(`Ваш логин ${log}`);
            ctx.session.status = Status.Password;
            await ctx.reply('Введите пароль');
        } else {
            ctx.session.status = Status.Login;
            ctx.reply(
                'У вас не указано имя пользователя в телеграме, введите логин'
            );
        }
    }

    @Action('registration_login_no')
    async registration_login_no(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.Login;
        await ctx.reply('Введите логин');
    }

    @Action('registration_back')
    async registration_back(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        await ctx.replyWithHTML(
            'Вы не авторизированы, если у вас нет аккаунта, зарегистрируйтесь',
            this.registration_login_keyboard
        );
    }

    @Action('registration_btn')
    async registration(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        await ctx.replyWithHTML('<b>Процесс Регистрации</b>');
        await ctx.replyWithHTML(
            'Вы хотите использовать логин телеграмма в качестве логина регистрации?',
            this.registration_login_ok_keyboard
        );
    }

    @Action('login_btn')
    async login(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.Login_Login;
        await ctx.replyWithHTML('<b>Процесс Авторизации</b>');
        await ctx.reply('Введите логин');
    }

    @Action('logout')
    async logout(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.token = null;
        ctx.session.role = null;
        ctx.session.login = null;
        ctx.session.password = null;
        await ctx.reply('Вы успешно вышли с аккаунта');
        this.auth(ctx);
    }

    @Action('main_back')
    async main_back(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            await ctx.replyWithHTML(
                `<b>Главное меню</b>\nВы авторизированы как ${ctx.session.login}, ваша роль ${ctx.session.role}`,
                this.main_keyboard
            );
        }
    }

    @Action('main_users')
    async main_users(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            await ctx.replyWithHTML(
                '<b>Панель управления пользователями</b>',
                this.users_keyboard
            );
        }
    }

    @Action('main_network')
    async main_network(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            await ctx.replyWithHTML(
                '<b>Панель управления нейросетью</b>',
                this.network_keyboard
            );
        }
    }

    @Action('users_getAll')
    async users_getAll(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        try {
            await this.telegramBotService
                .getAllUsers(ctx.session)
                .forEach((element) => {
                    element.data.forEach(async (user) => {
                        await ctx.reply(
                            `Пользователь\nid:${user._id}\nlogin:${user.login}\nroles:${user.roles}\ntelegramId:${user.telegramId}\n`
                        );
                    });
                });
            await ctx.replyWithHTML(
                '<b>Панель управления пользователями</b>',
                this.users_keyboard
            );
        } catch (error) {
            await ctx.reply(
                `Ошибка, недостаточно прав. Повторите попытку`,
                this.users_keyboard
            );
        }
    }

    @Action('users_getByLogin')
    async users_getByLogin(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.User_Log;
        ctx.reply('Введите логин пользователя');
    }

    @Action('users_addRole')
    async users_addRole(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.User_addRole;
        ctx.reply('Введите id пользователя, которому хотите добавить роль');
    }

    @Action('users_removeRole')
    async users_removeRole(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.User_removeRole;
        ctx.reply('Введите id пользователя, у которого хотите забрать роль');
    }

    @Action('users_remove')
    async users_remove(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.User_remove;
        ctx.reply('Введите id пользователя, которого хотите удалить');
    }

    @Action('main_roles')
    async main_roles(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            await ctx.replyWithHTML(
                '<b>Панель управления ролями</b>',
                this.roles_keyboard
            );
        }
    }

    @Action('roles_getAll')
    async roles_getAll(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        try {
            await this.telegramBotService.getAllRoles().forEach((element) => {
                element.data.forEach(async (role) => {
                    await ctx.reply(
                        `Роль\nid:${role._id}\nvalue:${role.value}\ndescription:${role.description}\n`
                    );
                });
            });
            await ctx.replyWithHTML(
                '<b>Панель управления ролями</b>',
                this.roles_keyboard
            );
        } catch (error) {
            await ctx.reply(
                `Ошибка, недостаточно прав. Повторите попытку`,
                this.users_keyboard
            );
        }
    }

    @Action('roles_create')
    async roles_create(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.Roles_value;
        ctx.reply('Введите название роли, которую хотите создать');
    }

    @Action('roles_remove')
    async roles_remove(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.Roles_remove;
        ctx.reply('Введите название роли, которую хотите удалить');
    }

    //Нейросеть
    @Action('network_getDatasets')
    async network_getDatasets(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            try {
                let datasets = '';
                await this.telegramBotService
                    .getDatasets()
                    .forEach((element) => {
                        element.data.forEach(async (dataset) => {
                            datasets += `\n-- ${dataset}`;
                        });
                    });
                await ctx.reply(`Доступные датасеты:${datasets}`);
                await ctx.replyWithHTML(
                    '<b>Панель управления нейросетью</b>',
                    this.network_keyboard
                );
            } catch (error) {
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.network_keyboard
                );
            }
        }
    }

    @Action('network_getModels')
    async network_getModels(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            try {
                let models = '';
                await this.telegramBotService.getModels().forEach((element) => {
                    element.data.forEach(async (model) => {
                        models += `\n-- ${model}`;
                    });
                });
                await ctx.reply(`Доступные обученные модели:${models}`);
                await ctx.replyWithHTML(
                    '<b>Панель управления нейросетью</b>',
                    this.network_keyboard
                );
            } catch (error) {
                await ctx.reply(
                    `${error.response.data.message}. Повторите попытку`,
                    this.network_keyboard
                );
            }
        }
    }

    @Action('network_createDataset')
    async network_createDataset(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            ctx.session.status = Status.Network_CreateDateset;
            ctx.reply('Введите наименование датасета, который хотите создать');
        }
    }

    @Action('network_deleteDataset')
    async network_deleteDataset(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            ctx.session.status = Status.Network_DeleteDateset;
            ctx.reply('Введите наименование датасета, который хотите удалить');
        }
    }

    @Action('network_deleteModel')
    async network_deleteModel(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            ctx.session.status = Status.Network_DeleteModel;
            ctx.reply('Введите наименование модели, которую хотите удалить');
        }
    }

    @Action('network_train')
    async network_train(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            ctx.session.status = Status.Network_Train;
            ctx.reply(
                'Введите наименование датасета, на котором хотите обучить модель'
            );
        }
    }

    @Action('network_addFiles')
    async network_addFiles(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            ctx.session.status = Status.Network_AddFiles;
            ctx.reply(
                'Введите наименование датасета, в который хотите добавить изображения'
            );
        }
    }

    @Action('network_deleteFiles')
    async network_deleteFiles(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        if (this.auth(ctx)) {
            ctx.session.status = Status.Network_DeleteFiles;
            ctx.reply(
                'Введите наименование датасета, в котором хотите удалить изображения'
            );
        }
    }

    @Action('network_isTrainTrue')
    async network_isTrainTrue(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.networkIsTrain = 'true';
        ctx.reply(
            'На этих изображениях изображен объект, который необходимо найти?',
            this.networkIsTarget_keyboard
        );
    }

    @Action('network_isTrainFalse')
    async network_isTrainFalse(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.networkIsTrain = 'false';
        ctx.reply(
            'На этих изображениях изображен объект, который необходимо найти?',
            this.networkIsTarget_keyboard
        );
    }

    @Action('network_isTargetTrue')
    async network_isTargetTrue(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.networkIsTarget = 'true';
        try {
            await this.telegramBotService
                .addFiles(ctx.session)
                .forEach((element) => {
                    let t = 'обучающий';
                    let target = 'целевого объекта';
                    if (ctx.session.networkIsTrain == 'false') {
                        t = 'тестовый';
                    }
                    if (ctx.session.networkIsTarget == 'false') {
                        target = 'других объектов';
                    }
                    ctx.reply(
                        `Файлы успешно сохранены в ${t} датасет, с изображением на них ${target}`,
                        this.network_keyboard
                    );
                });
        } catch (error) {
            await ctx.reply(
                `${error.response.data.message}. Повторите попытку`,
                this.network_keyboard
            );
        }
    }

    @Action('network_isTargetFalse')
    async network_isTargetFalse(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.networkIsTarget = 'false';
        try {
            await this.telegramBotService
                .addFiles(ctx.session)
                .forEach((element) => {
                    let t = 'обучающий';
                    let target = 'целевого объекта';
                    if (ctx.session.networkIsTrain == 'false') {
                        t = 'тестовый';
                    }
                    if (ctx.session.networkIsTarget == 'false') {
                        target = 'других объектов';
                    }
                    ctx.reply(
                        `Файлы успешно сохранены в ${t} датасет, с изображением на них ${target}`,
                        this.network_keyboard
                    );
                });
        } catch (error) {
            await ctx.reply(
                `${error.response.data.message}. Повторите попытку`,
                this.network_keyboard
            );
        }
    }

    @Action('network_deleteIsTrainFalse')
    async network_deleteIsTrainFalse(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.networkIsTrain = 'false';
        ctx.session.status = Status.Network_DeleteFileNames;
        try {
            let files = '';
            await this.telegramBotService
                .getStaticImages(ctx.session)
                .forEach(async (element) => {
                    element.data.forEach((file) => {
                        files += `\n${file.split(`\\`).at(-1)}`;
                    });
                });
            await ctx.reply(`Файлы в папке:${files}`);
        } catch (error) {
            console.log(error);
        }
        ctx.reply(
            'Введите названия файлов, которые хотите удалить(вводить через запятую)'
        );
    }

    @Action('network_deleteIsTrainTrue')
    async network_deleteIsTrainTrue(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.networkIsTrain = 'true';
        try {
            let files = '';
            await this.telegramBotService
                .getStaticImages(ctx.session)
                .forEach(async (element) => {
                    element.data.forEach((file) => {
                        files += `\n${file.split(`\\`).at(-1)}`;
                    });
                });
            await ctx.reply(`Файлы в папке:${files}`);
        } catch (error) {
            console.log(error);
        }
        ctx.session.status = Status.Network_DeleteFileNames;
        ctx.reply(
            'Введите названия файлов, которые хотите удалить(вводить через запятую)'
        );
    }

    @Action('network_predict')
    async network_predict(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        ctx.session.status = Status.Network_LoadFiles;
        ctx.session.networkFiles = new Array();
        ctx.session.isMany = false;
        ctx.reply(
            'Прикрепите файлы, по которым хотите получить прогноз(не сжимайте их)'
        );
        // if (this.auth(ctx)) {
        //     try {
        //         let models = '';
        //         await this.telegramBotService.getModels().forEach((element) => {
        //             element.data.forEach(async (model) => {
        //                 models += `\n-- ${model}`;
        //             });
        //         });
        //         await ctx.reply(`Доступные обученные модели:${models}`);
        //         ctx.session.status = Status.Network_Predict;
        //         await ctx.reply('Введите название модели для предсказания');
        //     } catch (error) {
        //         await ctx.reply(
        //             `${error.response.data.message}. Повторите попытку`,
        //             this.network_keyboard
        //         );
        //     }
        // }
    }

    @Action('network_results')
    async network_results(@Ctx() ctx: MyContext) {
        await ctx.answerCbQuery();
        console.log('callback');
    }
}
