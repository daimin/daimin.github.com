title:学习vue.js

tag:vue.js

date:2017-11-01



`{{ var }}` 用来输出变量

    
    var vm = new Vue({
        el: '#app',  # 对应一个DOM 元素进行挂载
        create(){ // 页面加载未渲染html之前执行。

        },
        mounted(){ //渲染html后再执行。由于created在html模板生产之前所以无法对Dom进行操作而mounted可以。

        },
        computed{ // 计算属性，在使用的时候直接返回，而且带有缓存功能，如果相关的值未改变将不会重复计算。默认只有getter，也可以设置setter

        },
        watch{ //监控变量或方法，如果是监控方法，需要配合computed来使用。如果监控对象需要深度watch，比如有一个对象a={b:1}，监控b。
                // 1. 'a.b'(newval,oldval){}
                // 2. 这里也可以用computed，将变量作为计算属性返回
                // 3. 又或者深度监听a{hander(newval,oldval),deep:true}（这个性能比较差，因为只要对象中任意变量改动都会调用handler）。

        },
        data(){ # data是Vue对象的属性，一般最好作为方法return，可以避免数据污染
            return {
                newPerson: {
                name: '',
                age: 0,
                sex: 'Male'
                },
                peoples:[ ]
            }
        },
        methods:{ # vue对象的方法
            createPerson: function(){
                this.peoples.push(this.newPerson);
                // 添加完newPerson对象后，重置newPerson对象
                this.newPerson = {name: '', age: 0, sex: 'Male'}
            }
        }
    })
    

1. 常用指令
    * v-bind 指令可以用于响应式地更新 HTML 属性，缩写为冒号 : 
    * v-for会对使用它的标签进行循环
    * v-on 用于监听 DOM 事件，缩写为@
    * v-model 指令在表单控件元素上创建双向数据绑定
    * v-show 用于根据条件展示元素
    * v-if和v-show类似，不过他可以接v-else，还有v-else-if  
        v-if 和v-show类似，不过二者还有有区别，v-if切换消耗较大，v-show初始化时消耗较大，因为v-if是惰性渲染。频繁变动的用v-show，否则用v-if
    * v-once可以控制变量变化时绑定的数据不变化。
    * v-html用来原始输出html

2. 组件
    
    1.  使用组件  
    应该在挂载元素范围内使用组件
    
        <div id="app">
            <!-- 3. #app是Vue实例挂载的元素，应该在挂载元素范围内使用组件-->
            <my-component></my-component>
        </div>

            // 创建一个组件构造器
            var myComponent = Vue.extend({
                template: '<div>This is my first component!</div>'
            })

            new Vue({
                el: '#app',
                components: {
                    // 可以将myComponent组件注册到Vue实例下
                    'my-component' : myComponent
                }
            });

            // 也可以全局注册组件。可以在页面中所有的vue挂载元素中使用该组件，不可以在非vue挂载元素中使用
            Vue.component('my-component', myComponent)

    2. 组件模板

            <script type="text/x-template" id="myComponent"> <!-- html5之前的写法 -->
                <div>This is a component!</div>
            </script>
            <template id="myComponent"> <!-- html5支持该标签 -->
                <div>This is a component!</div>
            </template>
            Vue.component('my-component',{
                template: '#myComponent'
            })
            new Vue({
                el: '#app'
            })

    3. 嵌套组件

            <div id="app">
                <parent-component>
                </parent-component>
            </div>
            var Child = Vue.extend({
                template: '<p>This is a child component!</p>'
            })
            
            var Parent = Vue.extend({
                // 在Parent组件内使用<child-component>标签 , template中必须有一个根节点
                template :'<div><p>This is a Parent component</p><child-component></child-component></div>',
                components: {
                    // 局部注册Child组件，该组件只能在Parent组件内使用
                    'child-component': Child
                }
            })
            
            // 全局注册Parent组件
            Vue.component('parent-component', Parent)
            
            new Vue({
                el: '#app'
            })
    
 3. 使用props  
    父组件的数据需要通过 prop 才能下发到子组件中，也就是props是子组件访问父组件数据的唯一接口。  
    如果子组件想要引用父元素的数据，那么就在其prop里面声明一个变量（比如a），这个变量就可以引用父元素的数据。然后在模板里渲染这个变量（前面的a），这时候渲染出来的就是父元素里面的数据。

        <div id="app">
        <!--在子组件中定义prop时，使用了camelCase命名法。由于HTML属性不区分大小写，camelCase的prop用于属性时，需要转为 kebab-case（短横线隔开）。例如，在prop中定义的myName，在用作属性时需要转换为my-name。-->
            <my-component :my-name="name" :my-age="age"></my-component>
        </div>
        <template id="myComponent">
            <table>
                <tr>
                    <th colspan="2">
                        子组件数据
                    </th>
                </tr>
                <tr>
                    <td>my name</td>
                    <td>{{ myName }}</td>
                </tr>
                <tr>
                    <td>my age</td>
                    <td>{{ myAge }}</td>
                </tr>
            </table>
        </template>
        var vm = new Vue({
            el: '#app',
            data: {
                name: 'keepfool',
                age: 28
            },
            components: {
                'my-component': {
                    template: '#myComponent',
                    props: ['myName', 'myAge']
                }
            }
        })


 4. 使用slot   
    slot就是将父组件的DOM显示在子组件中，父组件决定内容，子组件决定位置。

    1. 没有名字的slot，就是父节点模板中子组件标签的内容作为slot显示在子组件的DOM中。

            <my-component>
                <h1>Hello Vue.js!</h1>  <!--将会替换子组件的slot标签来展示-->
            </my-component>
            <template id="myComponent">
                <div class="content">
                    <h2>This is a component!</h2>
                    <slot>如果没有分发内容，则显示slot中的内容</slot>
                    <p>Say something...</p>
                </div>
            </template>

    2. 具名的slot，父节点中的有slot属性的标签将会替换子组件中具名的slot。

            <!-- slot属性为header的标签将会提交子组件中name等于header的slot -->
            <header class="dialog-header" slot="header">
                <h1 class="dialog-title">
                    提示信息
                </h1>
            </header>
            <template id="dialog-template">
                <div>
                    <slot name="header">
                    </slot>
                </div>
             </template>

5. $emit
    1. 父组件可以使用 props 把数据传给子组件。(这个上面已经讨论过)
    2. 可以使用 $emit 触发组件的自定义事件。 用这个其实可以将子组件的数据传递给任一组件。其实这个容易使逻辑变复杂，不推荐过分使用。
        vm.$emit( event, arg ) //触发当前实例上的事件  
        vm.$on( event, func) //监听event事件后运行 fn； 
    3. 还可以单独new一个Vue实例，专门用来$emit发射自定义事件和$on监听自定义事件。

6. ref

    可以给子组件的标签的ref属性指定一个名称，然后就可以通过其父组件的$refs来引用这个组件。
    比如：
        
        <childcp ref="acp"></childcp>
        this.$parent.$refs.acp // 可以引用这个子组件
        this.$root // 指向根组件 
        this.$parent.$ref.acp.$emit('aevent', []) //向acp发射自定义事件，可以在这个组件中this.$on来监听
        
    
