var cb=function(){console.log(1)}
process.nextTick(() => {
    console.log('第一个nextTick');
});

console.log('\n先输出我吗？\n');

setTimeout(() => {
    console.log('\n会执行其它地方的已经执行过的nextTick吗');
    // process.nextTick(cb);
}, 3000);

setTimeout(() => {
    console.log('\n会执行其它地方的未执行的nextTick吗');
    // process.nextTick(cb);
}, 2500);

setTimeout(() => {
    console.log('\n开始setTimeout');
    process.nextTick(cb);
    setTimeout(() => {
        console.log('\n我是在1000里的1200');
    }, 1200);
}, 1000);

setInterval(() => {
    console.log('\n开始setInterval');
    process.nextTick(cb);
}, 2000);


process.nextTick(() => {
    console.log('最后一个代码块');
});