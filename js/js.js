$(function(){
    
    $clk = $('svg path');
    $('#cmd_console').bind('keydown',function(event) {
        res = true;
        switch(event.keyCode)
        {
            case 13://enter
                new_d = $clk.attr('d')+'h 30 v 20 h 30 v -20';
                $clk.attr({'d': new_d});
                res = false;
                break;
            case 38://上键
                res = false;
                break;
            case 40://下键
                res = false;
                break;
            default :
                break;
        }
        return res;
    });
    col = 0
    row = 0
    grid = false;
    preci = [5,5];//width,height
    cmd_str = 'clk clk_name 3{3,3}'

    function cmd2wave($svg,cmd_str)
    {
        cmd_list = cmd_str.split(' ',4);
        // alert(cmd_list);
        // for(item in cmd_list)
        // {
        //     alert(cmd_list[item]);
        // }
        switch(cmd_list[0])
        {
            case 'clk':
                $svg.html($svg.html()+'<text x="30" y="30" style="stroke:black;stroke-width:1;font-size:20;">'+cmd_list[1]+'</text>');
                break;
            default:
                console.log('不能识别的命令：'+cmd_list[0]+' 在命令：'+cmd_str);
                break;
        }

    }
    cmd2wave($('svg'),cmd_str);
    

})
