$(function(){
    
    $clk = $('svg path');
    $('#do_wave').bind('click', function(event) {
        $('svg').html(' ');
            row = 1;
            console_list = $('#cmd_console').val().split('\n');
            for(k=0;k<console_list.length;k++)
            {
                switch(console_list[k].substr(0,3).toLowerCase())
                {
                    case 'def':
                        var_defined(console_list[k]);
                        break;
                    case 'clk'://clk或sig都用signal_cmd2wave，内部识别clk和sig
                    case 'sig':
                        signal_cmd2wave($('svg'),console_list[k]);
                        break;
                    case 'bus':
                        bus_cmd2wave($('svg'),console_list[k]);
                        break;
                    case 'txt':
                        text_add($('svg'),console_list[k]);
                        break;
                    case 'lin':
                        line_cmd2wave($('svg'),console_list[k]);
                        break;
                }
            }
    });
    $('#cmd_console').bind('keydown',function(event) {
        res = true;
        if(event.keyCode == 116)//f5
        {
            $('#do_wave').click();
            res = false;
        }
        return res;
    });
    left_space = 100;//左边显示字符的空白
    top_space = 50;//顶上显示的空白
    spacing = 10;//每行之间的间隔
    row = 1;//当前行数，从1开始
    preci = [10,20];//定义x和y方向变化精度，x方向精度即sig,bus,lin中x方向数字的单位；y方向变化精度，即lin中y方向数字的单位，每行信号高度
    /* 
一下及本行不是关键字开头的就为注释：def定义特殊变量；sig定义单信号或时钟；bus定义多位宽信号；txt显示文本于指定位置（注意单位为px）；lin画垂直虚线
将代码写入网页底部文本框中后按f5后执行
def left_space 150 定义左边空白区域大小(px)用于显示信号名
def top_space 10 定义上边空白区域大小(px)
def spacing 10 定义每行之间的间隔(px)
def preci_x 10 定义x方向变化精度(px)，即sig,bus,lin中x方向数字的单位
def preci_y 20 定义y方向变化精度(px)，即lin中y方向数字的单位，每行信号高度
一下sig,bus之后不能有注释：
绘制时钟信号，10个时钟周期，先5个单位高电平后5个单位低电平
sig clk 10{5h,5l}
位宽为1的信号，l和h命令不能连续用两个，要间隔交替使用
sig sign1 3{3h,3l} 5{5h,5l} {5h} 3{7l,5h}
位宽大于1的信号
bus sign2 3{3v,3z,5z,8v} {5z} 3{7v,5z,3v,1z}
信号名为中文
bus ad中文测试 {3z,5v,2z,10v,30,20v}
txt 测试文本 750 125 在指定位置显示文本，这里的坐标单位x,y和其它不同这里单位为px
lin 9{0,1,4,10} 指定垂直虚线：重复次数{开始x位置，开始y位置，开始y结束，重复间隔}
lin {2,1,3,60} 不带重复的垂直虚线
    */
    function var_defined(cmd_str)
    {
        cmd_list = cmd_str.split(' ');
        switch(cmd_list[1].toLowerCase())
        {
            case 'left_space':
                left_space = parseInt(cmd_list[2]);
                break;
            case 'top_space':
                top_space = parseInt(cmd_list[2])
                break;
            case 'spacing':
                spacing = parseInt(cmd_list[2])
                break;
            case 'preci_x':
                preci[0] = parseInt(cmd_list[2])
                break;
            case 'preci_y':
                preci[1] = parseInt(cmd_list[2])
                break;
            default:
                console.log("不能识别的命令："+cmd_list[1]+"在命令："+cmd_str);
                break;
        }
    }
    // 绘制信号，clk:上下沿为垂直线;sig:上下沿为斜线
    function signal_cmd2wave($svg,cmd_str)
    {
        // cmd_list = cmd_str.split(' ',4);
        cmd_text = cmd_str.substr(0,3).toLowerCase();
        cmd_list = cmd_str.split(' ');
        cmd_len = cmd_list.length;
        first_h = false;
        attr_d = '';
        for(i=2;i<cmd_len;i++)
        {
            sig_list = cmd_list[i].substring(cmd_list[i].indexOf('{')+1,cmd_list[i].indexOf('}')).split(',');
            sig_len = sig_list.length;
            sig_d = ''
            for(j=0;j<sig_len;j++)//将命令转换为path的d
            {
                if(sig_list[j][sig_list[j].length-1].toLowerCase() == 'h')//逗号分隔的数字后的字符表示向上或向下
                {
                    v_num = -preci[1];
                    if(i==2&&j==0)//判断是否第一个命令为h
                    {
                        first_h = true;
                    }
                }
                else
                {
                    v_num = preci[1];
                }
                if(cmd_text == 'clk')
                {
                    sig_d = sig_d + ' v ' + v_num + ' h ' + (parseInt(sig_list[j])*preci[0]);
                }
                else// if(cmd_text == 'sig')//若不为clk就以斜线代替垂线
                {
                    sig_d = sig_d + ' l ' + preci[0]/2 + ',' + v_num + ' h ' + (parseInt(sig_list[j])*preci[0]-preci[0]/2);
                }
            }
            repeat_num = parseInt(cmd_list[i]);//取前面的重复次数
            repeat_d = sig_d;
            while(--repeat_num > 0)//将本次所得数据字符重复
            {
                repeat_d = repeat_d + sig_d;
            }
            attr_d = attr_d + repeat_d;
        }
        path_move_str = 'M ' + left_space + ',';
        row_y = top_space+row*(preci[1]+spacing);//本行底线的y值
        if(first_h == true)
        {
            path_move_str = path_move_str + row_y;
        }
        else
        {
            path_move_str = path_move_str + (row_y-preci[1]);
        }
        
        path_str = '<path d="'+ path_move_str + attr_d + '" style="fill:none;stroke:black;stroke-width:1;" />';
        text_str = '<text x="' + (left_space-10) +'" y="' + (row_y-5) + '" style="stroke:black;stroke-width:1;font-size:14px;text-anchor:end;">'+cmd_list[1]+'</text>';
        
        $svg.html($svg.html()+path_str+text_str);
        row++;
    }
    
    function bus_cmd2wave($svg,cmd_str)
    {
        cmd_list = cmd_str.split(' ');
        cmd_len = cmd_list.length;
        attr_d1 = '';//绘制bus两条path的d
        attr_d2 = '';
        for(i=2;i<cmd_len;i++)
        {
            sig_list = cmd_list[i].substring(cmd_list[i].indexOf('{')+1,cmd_list[i].indexOf('}')).split(',');
            sig_len = sig_list.length;
            sig_d1 = '';
            sig_d2 = '';
            for(j=0;j<sig_len;j++)//将命令转换为path的d
            {
                x_num = parseInt(sig_list[j])*preci[0]; //x方向递增距离
                y_num = preci[1]/2
                if(sig_list[j][sig_list[j].length-1].toLowerCase() == 'v')//逗号分隔的数字后的字符表示v或z
                {
                    sig_d1 = sig_d1 + 'l ' + preci[0]/2 + ',' + -y_num + 'l ' + (x_num-preci[0]) + ',0 l ' + preci[0]/2 + ',' + y_num;
                    sig_d2 = sig_d2 + 'l ' + preci[0]/2 + ',' + y_num + 'l ' + (x_num-preci[0]) + ',0 l ' + preci[0]/2 + ',' + -y_num;
                }
                else
                {
                    sig_d1 = sig_d1 + 'l ' + x_num + ',0';//不为v就默认为z
                    sig_d2 = sig_d2 + 'l ' + x_num + ',0';
                }
            }
            repeat_num = parseInt(cmd_list[i]);//取前面的重复次数
            repeat_d1 = sig_d1;
            repeat_d2 = sig_d2;
            while(--repeat_num > 0)//将本次所得数据字符重复
            {
                repeat_d1 = repeat_d1 + sig_d1;
                repeat_d2 = repeat_d2 + sig_d2;
            }
            attr_d1 = attr_d1 + repeat_d1;
            attr_d2 = attr_d2 + repeat_d2;
        }

        path_move_str = 'M ' + left_space + ',';
        row_y = top_space+row*(preci[1]+spacing);//本行底线的y值
        path_move_str = path_move_str + (row_y-preci[1]/2);

        path1_str = '<path d="'+ path_move_str + attr_d1 + '" style="fill:none;stroke:black;stroke-width:1;" />';
        path2_str = '<path d="'+ path_move_str + attr_d2 + '" style="fill:none;stroke:black;stroke-width:1;" />';
        text_str = '<text x="' + (left_space-10) +'" y="' + (row_y-5) + '" style="stroke:black;stroke-width:1;font-size:14px;text-anchor:end;">'+cmd_list[1]+'</text>';
        
        $svg.html($svg.html()+path1_str+path2_str+text_str);
        row++;
    }
    function text_add($svg,cmd_str)
    {
        cmd_list = cmd_str.split(' ');
        text_str = '<text x="'+ cmd_list[2] + '" y="'+ cmd_list[3] + '" style="stroke:black;stroke-width:1;font-size:14px;">' + cmd_list[1] + '</text>';
        $svg.html($svg.html()+text_str);
    }
    function line_cmd2wave($svg,cmd_str)
    {
        cmd_list = cmd_str.split(' ');
        sig_list = cmd_list[1].substring(cmd_list[1].indexOf('{')+1,cmd_list[1].indexOf('}')).split(',');
        repeat_num = parseInt(cmd_list[1]);//取前面的重复次数
        x1 = left_space+sig_list[0]*preci[0];
        y1 = top_space+parseInt(sig_list[1])*(preci[1]+spacing)-preci[1]/2;
        x2 = x1;
        y2 = top_space+parseInt(sig_list[2])*(preci[1]+spacing)-preci[1]/2;
        line_str = '<line x1="'+ x1 +'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" style="stroke-width:1;stroke:black;stroke-dasharray:2,2;" />'
        while(repeat_num > 1)
        {
            x1 = x1 + parseInt(sig_list[3])*preci[0];
            x2 = x1;
            line_str = line_str+'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" style="stroke-width:1;stroke:black;stroke-dasharray:2,2;" />'
            --repeat_num;
        }
        $svg.html($svg.html()+line_str);
    }
})
