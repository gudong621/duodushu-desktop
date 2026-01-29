// 可以直接在【词典软件】里搜索以下任意词条，进入配置界面：
// 推荐使用：1. 欧路词典 Eudic (全平台), 2. GoldenDict-ng (电脑端)
// oaldpeconfig, oaldpecfg, oaldpehelp, oaldconfig, oaldcfg, oaldhelp

/* ********用户自定义配置区开始******** */
var oaldpeConfig = {
    /******** 中文翻译相关 ********/
    chineseTranslation: {
        groupTitle: '中文翻译相关', // 配置组标题

        // 【配置项1：中文翻译选项】
        showTranslation: {
            selectedValue: 1,    // 默认显示所有中文翻译
            title: '中文翻译选项', // 配置项标题
            type: 'dropdown',    // 在配置界面下，该选项为下拉框选择
            options: [
                { value: 0, label: '全部隐藏' }, // 隐藏所有中文翻译
                { value: 1, label: '全部显示' }, // 显示所有中文翻译
                { value: 2, label: '仅隐藏例句中文' }, // 隐藏例句中的中文翻译
                { value: 3, label: '仅显示例句中文' }, // 仅显示例句中的中文翻译
                { value: 4, label: '仅隐藏释义中文' }, // 隐藏释义中的中文翻译
                { value: 5, label: '仅显示释义中文' }  // 仅显示释义中的中文翻译
            ],
            description: '设置初始状态下，中文翻译的显示/隐藏。', // 配置项描述
            callout: [
                { type: 'tip', content: ['单击右上角的 O10 小图标，可显示/隐藏所有中文翻译。', '默认隐藏部分中文翻译时，可搭配点译功能使用。'] } // 相关提示
            ]
        },

        // 【配置项2：启用英文点译功能】
        touchToTranslate: {
            selectedValue: false, // 默认为不启用
            title: '启用英文点译功能',
            type: 'checkbox' // 在配置界面下，该选项为复选框（checkbox）开关
        },

        // 【配置项3：是否使用简繁转换】
        showTraditional: {
            selectedValue: 0, // 默认为简体中文
            title: '是否使用简繁转换',
            type: 'dropdown',
            options: [
                { value: 0, label: '简体（不使用简繁转换）' }, // 简体中文翻译
                { value: 1, label: '繁体（香港）' }, // 香港繁体中文翻译
                { value: 2, label: '繁体（台湾）' }, // 台湾繁体中文翻译
                { value: 3, label: '繁体（台湾，带词组转换）' } // 台湾繁体中文翻译（带词组转换）
            ]
        },

        // 【配置项4：离线图片翻译选项】
        imgTranslationOpt: {
            selectedValue: 0, // 默认为根据其他设置自动选择
            title: '离线图片翻译选项',
            type: 'dropdown',
            options: [
                { value: 0, label: '不使用翻译' }, // 原版英文图片
                { value: 1, label: '简体中文翻译' }, // 港版 app 简体中文翻译
                { value: 2, label: '港版繁体翻译' }, // 港版 app 繁体中文翻译
                { value: 3, label: '根据其他设置自动选择' } // 根据配置项【中文翻译选项】和配置项【是否使用简繁转换】自动选择
            ],
            callout: [
                { type: 'warning', content: '当【在线图片】启用时，图片翻译无效。' } // 注意事项
            ]
        },

        // 【配置项5：翻译来源：默认高亮区分非官方翻译】
        highlightUnofficial: {
            selectedValue: false, // 默认为不高亮区分，统一样式
            title: '翻译来源：默认高亮区分非官方翻译',
            type: 'checkbox',
            description: '设置初始状态下，是否使用不同的样式区分翻译来源。',
            callout: [
                { type: 'info', content: ['默认为不高亮区分，统一样式，减少阅读干扰。', '中文翻译来源详见帮助界面 FAQ。'] } // 附加说明
            ]
        }
    },

    /******** 词性导航栏 ********/
    posNavbar: {
        groupTitle: '词性导航栏',

        // 【配置项1：启用词性导航栏】
        showNavbar: {
            selectedValue: false, // 默认为启用
            title: '启用词性导航栏',
            type: 'checkbox',
            description: '控制是否启用词性导航栏，便于在多词性词条中快速切换。'
        },

        // 【配置项2：是否选中词性导航栏 All】
        selectNavbarAll: {
            selectedValue: false, // 默认为不选中
            title: '是否选中词性导航栏 All',
            type: 'checkbox',
            description: '设置初始状态下，是否选中词性导航栏 All。'
        }
    },

    /******** 内容精简 ********/
    contentSimplification: {
        groupTitle: '内容精简',

        // 【配置项1：简化词性表示】
        simplifyPos: {
            selectedValue: false, // 默认不简化
            title: '简化词性表示',
            type: 'checkbox',
            description: '控制是否将词性表示简化（例如将 verb 简化为 v.）。'
        },

        // 【配置项2：简化语法标签】
        simplifyGrammar: {
            selectedValue: false, // 默认不简化
            title: '简化语法标签',
            type: 'checkbox',
            description: '控制是否将语法标签简化（例如将 [transitive] 简化为 [T]）。'
        },

        // 【配置项3：简化固定搭配中的 sth./sb.】
        simplifySthSb: {
            selectedValue: true, // 默认简化
            title: '简化固定搭配中的 sth./sb.',
            type: 'checkbox',
            description: '控制是否将固定搭配中的 something/somebody 简化为 sth./sb.。'
        },

        // 【配置项4：在固定搭配中使用代字号】
        usePlaceholder: {
            selectedValue: false, // 默认不使用
            title: '在固定搭配中使用代字号',
            type: 'checkbox',
            description: '控制是否将固定搭配中的关键词替换为代字号（例如将 take sth. with you 替换为 ~ sth. with you）。'
        },
    },

    /******** 显示控制 ********/
    contentDisplay: {
        groupTitle: '显示控制',

        // 【配置项1：默认显示音节划分】
        showSyllable: {
            selectedValue: false, // 默认为不显示
            title: '默认显示音节划分',
            type: 'checkbox',
            description: '设置初始状态下，是否显示多音节单词的音节划分。',
            callout: [
                { type: 'tip', content: '点击词头，可以切换音节划分的显示与否。' }
            ]
        },

        // 【配置项2：默认英音例句发音】
        defaultBritishExPron: {
            selectedValue: false, // 默认为美音发音
            title: '默认英音例句发音',
            type: 'checkbox',
            description: '例句发音只显示一个喇叭，设置初始状态下为英音或美音。',
            callout: [
                { type: 'info', content: ['可以在 O10 小图标展开的界面中：', '(1) 切换当前例句发音（即时生效）', '(2) 设置默认例句发音（下次查询起生效）'] }
            ]
        },

        // 【配置项3：固定搭配荧光笔下划线】
        phrasesAddUnderline: {
            selectedValue: false, // 默认不添加
            title: '固定搭配荧光笔下划线',
            type: 'checkbox',
            description: '控制是否为固定搭配添加荧光笔下划线以突出显示。'
        },

        // 【配置项4：例句中文独占一行】
        examplesChineseBeAlone: {
            selectedValue: true, // 默认为例句中文独占一行
            title: '例句中文独占一行',
            type: 'checkbox',
            description: '控制是否在例句英文后换行，例句中文独占一行显示。'
        }
    },

    /******** 在线资源 ********/
    onlineResources: {
        groupTitle: '在线资源',

        // 【配置项1：在线单词发音】
        onlineWordPron: {
            selectedValue: false, // 默认为不启用
            title: '在线单词发音',
            type: 'checkbox',
            description: '启用后，可以删除 oaldpe.1.mdd 文件。'
        },

        // 【配置项2：在线图片】
        onlineImage: {
            selectedValue: false, // 默认为不启用
            title: '在线图片',
            type: 'checkbox',
            description: '启用后，可以删除 oaldpe.2.mdd 文件。',
            callout: [
                { type: 'info', content: '在线图片无中文翻译。' }
            ]
        },

        // 【配置项3：官方例句发音选项】
        officialExPronOpt: {
            selectedValue: 0, // 默认为官方例句在线发音
            title: '官方例句发音选项',
            type: 'dropdown',
            options: [
                { value: 0, label: '不启用官方例句发音' },
                { value: 1, label: '在线发音' }, // 联网在线发音
                { value: 2, label: '离线发音' }  // 离线发音文件
            ],
            description: '如果启用在线发音（或不启用官方例句发音），可以删除 oaldpe.3.mdd 文件。',
            callout: [
                { type: 'success', content: ['默认启用在线发音，音质较好。', '离线发音可作为无 Wi-Fi 或无网络环境下的备选方案。'] }
            ]
        },

        // 【配置项4：是否删除无在线发音的官方例句发音】
        removeNoOnlineExPron: {
            selectedValue: false, // 默认为不删除
            title: '是否删除无在线发音的官方例句发音',
            type: 'checkbox',
            description: '删除 oaldpe.3.mdd 文件时，若仍需要使用在线发音，请同时开启此选项，因为该部分例句无在线发音。可转而使用 TTS 发音。',
        },

        // 【配置项5：无官方例句发音时，是否启用在线 TTS 发音】
        enableOnlineTTS: {
            selectedValue: true, // 默认为启用
            title: '无官方例句发音时，是否启用在线 TTS 发音',
            type: 'checkbox',
            description: '例句发音为 TTS 发音时，发音图标带下划线。'
        },

        // 【配置项6：TTS 英音发音配置】
        britishTTS: {
            selectedValue: '英音男1', // 默认使用英音男1
            title: 'TTS 英音发音配置',
            type: 'dropdown',
            options: [
                { value: '英音男1', label: '英音男1' },
                { value: '英音男2', label: '英音男2' },
                { value: '英音女1', label: '英音女1' },
                { value: '英音女2', label: '英音女2' },
                { value: '英音女3', label: '英音女3' }
            ]
        },

        // 【配置项7：TTS 美音发音配置】
        americanTTS: {
            selectedValue: '美音女4', // 默认使用美音女4
            title: 'TTS 美音发音配置',
            type: 'dropdown',
            options: [
                { value: '美音男1', label: '美音男1' },
                { value: '美音男2', label: '美音男2' },
                { value: '美音男3', label: '美音男3' },
                { value: '美音男4', label: '美音男4' },
                { value: '美音男5', label: '美音男5' },
                { value: '美音女1', label: '美音女1' },
                { value: '美音女2', label: '美音女2' },
                { value: '美音女3', label: '美音女3' },
                { value: '美音女4', label: '美音女4' }
            ]
        }
    },

    /******** 折叠控制 ********/
    collapseControl: {
        groupTitle: '折叠控制',

        // 【配置项1：默认展开释义】
        unfoldSense: {
            selectedValue: true, // 默认展开
            title: '默认展开释义',
            type: 'checkbox',
            description: '设置初始状态下，所有释义的展开/折叠状态。',
            callout: [
                { type: 'tip', content: ['点击释义前的序号，可以展开/折叠单项释义。', '双击右上角的 O10 小图标，可以展开/折叠所有释义。'] }
            ]
        },

        // 【配置项2：默认展开折叠块】
        unfoldUnbox: {
            selectedValue: true, // 默认不展开
            title: '默认展开折叠块',
            type: 'checkbox',
            description: '设置初始状态下，所有折叠块（浅蓝色折叠区，Extra Examples 更多例句等）的展开/折叠状态。'
        },

        // 【配置项3：默认展开特定折叠块】
        autoUnfoldUnbox: {
            selectedValue: { // 默认仅展开词源
                british_american: { value: true, label: 'British/American 英式 / 美式' },
                colloc: { value: true, label: 'Collocations 词语搭配' },
                cult: { value: true, label: 'Culture 文化' },
                express: { value: true, label: 'Express Yourself 情景表达' },
                extra_examples: { value: true, label: 'Extra Examples 更多例句' },
                grammar: { value: true, label: 'Grammar Point 语法说明' },
                homophone: { value: true, label: 'Homophones 同音词' },
                langbank: { value: true, label: 'Language Bank 用语库' },
                mlt: { value: true, label: 'More Like This 同类词语学习' },
                more_about: { value: true, label: 'More About 补充说明' },
                snippet: { value: true, label: 'Oxford Collocations Dictionary 牛津搭配词典' },
                synonyms: { value: true, label: 'Synonyms 同义词辨析' },
                verbforms: { value: true, label: 'Verb Forms 动词形式' },
                vocab: { value: true, label: 'Vocabulary Building 词汇扩充' },
                which_word: { value: true, label: 'Which Word? 词语辨析' },
                wordfamily: { value: true, label: 'Word Family 词族' },
                wordfinder: { value: true, label: 'Wordfinder 联想词' },
                wordorigin: { value: true, label: 'Word Origin 词源' }
            },
            title: '默认展开特定折叠块',
            type: 'nested-checkboxes',
            description: '设置初始状态下，特定折叠块的展开/折叠状态。',
            callout: [
                { type: 'warning', content: '当【默认展开折叠块】为 true 时，所有折叠块默认展开，此设置无效。' }
            ]
        },

         // 【配置项4：默认展开 Idioms 和 Phrasal Verbs】
        unfoldPhraseSections: {
            selectedValue: true, // 默认展开
            title: '默认展开 Idioms 和 Phrasal Verbs',
            type: 'checkbox',
            description: '设置初始状态下，习语 Idioms 和词组 Phrasal Verbs 区域是否展开。'
         },

        // 【配置项5：跳转后自动展开内容】
        jumpsUnfold: {
            selectedValue: true, // 默认跳转后自动展开
            title: '跳转后自动展开内容',
            type: 'checkbox',
            description: '控制点击 Idioms 或 Phrasal Verbs 跳转后，是否自动展开内容。'
        },

        // 【配置项6：返回后自动折叠内容】
        leavesFold: {
            selectedValue: true, // 默认返回后自动折叠
            title: '返回后自动折叠内容',
            type: 'checkbox',
            description: '控制点击小火箭返回后，是否自动折叠内容。'
        },
    },

    /******** 词典软件相关 ********/
    dictionaryAppRelated: {
        groupTitle: '词典软件相关',

        // 【配置项1：欧路词典：使用更大的屏宽】
        eudicWiderScreen: {
            selectedValue: 1, // 默认为启用（100%）
            title: '欧路词典：使用更大的屏宽',
            type: 'dropdown',
            options: [
                { value: 0, label: '不使用' },
                { value: 1, label: '100%' },
                { value: 2, label: '90%' },
                { value: 3, label: '80%' }
            ],
            description: '控制是否在欧路词典中使用更大的屏宽。'
        },

        // 【配置项2：使用 URL Hash 进行导航】
        instantHashNavigation: {
            selectedValue: false, // 默认为不启用（使用平滑滚动）
            title: '使用 URL Hash 进行导航',
            type: 'checkbox',
            description: '启用后，导航将使用地址栏 Hash 进行导航，而不是平滑滚动。部分词典软件可能需要启用此选项。'
        },

        // 【配置项3：欧路词典：隐藏左上角 Logo】
        eudicHideLogo: {
            selectedValue: true, // 默认为启用
            title: '欧路词典：隐藏左上角 Logo',
            type: 'checkbox',
            description: '控制是否在欧路词典中隐藏左上角 Logo。'
        },

        // 【配置项4：欧路词典：更多 Hazuki-note 功能】
        eudicHazukiNote: {
            selectedValue: false, // 默认为不启用
            title: '欧路词典：更多 Hazuki-note 功能',
            type: 'checkbox',
            description: '启用后，在欧路词典中可以使用更多 Hazuki-note 功能，如点击复制、双击 Google 等。',
            callout: [
                { type: 'info', content: 'Hazuki-note 是欧路词典社区作者 Hazuki 开发的欧路词典增强工具。' }
            ]
        }
    },

    /******** 其他功能 ********/
    otherFeatures: {
        groupTitle: '其他功能',

        // 【配置项1：自动跟随系统深色模式】
        autoDarkMode: {
            selectedValue: true, // 默认启用
            title: '自动跟随系统深色模式',
            type: 'checkbox',
            description: '是否自动根据系统设置启用深色模式。'
        },

        // 【配置项2：启用 Eruda Console】
        enableErudaConsole: {
            selectedValue: false, // 默认不启用
            title: '启用 Eruda Console',
            type: 'checkbox',
            description: '是否启用 Eruda 控制台，用于词典应用调试。'
        }
    }
};
/* ********用户自定义配置区结束******** */
