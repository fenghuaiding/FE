<template>
  <div class="row actions-wrapper">
    <div id="newtask-wrapper" class="col-xs-12 col-sm-8">
      <button class="btn btn-embossed btn-primary" v-on="click: onUploadFile">
        <i class="glyphicon glyphicon-open"></i>
        添加新打印任务
      </button>
    </div>
    <div class="hidden-xs col-sm-3 col-sm-offset-1">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="搜索您的文件" v-model="searchString">
        <span class="input-group-btn">
          <button class="btn"><i class="fui-search"></i></button>
        </span>
      </div>
    </div>
  </div>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <th>状态</th>
          <th>任务名</th>
          <th>打印店</th>
          <th>设置</th>
          <th>时间</th>       
          <th>操作</th>
        </tr>
      </thead>
      <tbody class="table-body">
        <tr v-repeat="task:displayTask" track-by="id">
          <td v-class="text-muted: task.status=='0' || task.status=='-1',
                       text-info: task.status=='1',
                       text-success: task.status=='2'"
          >{{statusDict[task.status]}}</td>
          <td class="text-primary">{{task.name}}</td>
          <td>{{task.printer}}</td>
          <td><span>{{task.copies}}</span>份<span>{{task.double==null? " ":(task.double=="1"? "双面":"单面")}}</span><span>{{task.color==null? "-": (task.color=="1"? "彩色":"黑白")}}</span></td>
          <td>{{task.time.substr(5,11)}}</td>
          <td style="text-align:center">
            <i class="glyphicon glyphicon-pencil" aria-hidden="true" style="cursor:pointer"
              v-on="click: onEditTask($event,task)"></i>
          </td>
        </tr>
      </tbody>
    </table>  
  </div>

  <div class="more" v-on="click: onLoadMore" v-if="moreData">加载更多...</div><!--没有更多时应为灰色-->
</template>

<script>
var yy_request = require('../js/yunyin_request')
var po = require('../js/public_object.js')

module.exports = {

  data: function() {
  	return {
  		displayedPage: 1,
  		tasksPerPage: 10,
  		taskData: [],
  		searchString: '',
  		showUploadModal: false,
  		moreData: false,
      statusDict: {
        "0": "用户取消",
        "1": "已上传",
        "2": "已下载",
        "3": "已打印",
        "4": "打印完成",
        "-1": "打印店取消",
      }
  	}
  },

  compiled: function () {
  	loadTasks(this)
    po.vueTaskList = this
  },

  computed: {
  	displayTask: function() {
  		var searchstr = this.searchString
  		var filtereddata = this.taskData.filter(function(x){
  			return (x.name.indexOf(searchstr)!=-1) || (x.printer.indexOf(searchstr)!=-1)
  		})
  		return filtereddata
  	},
  },

  methods: {
    onUploadFile: function() {
      po.app.fileTaskParams = {
        mode: 'newfile',
        fileList: [],
        taskinfo: {},
      }
      po.app.showFileTaskModal = true
    },

    onEditTask: function($event,task) {
      po.app.showFileTaskModal = true
      po.app.fileTaskParams = {
        mode: 'edittask',
        fileList: [],
        taskinfo: task,
      }
      
    },
  	onLoadMore: function() {
  		this.displayedPage = this.displayedPage + 1
  		loadTasks(this)
  	},

  	onTaskChange: function() {
  		this.displayedPage = 1
  		loadTasks(this)
  	}
  },

}

function loadTasks(vuemodel) {
  yy_request.rest_api({
    method: 'get',
    api: 'task/',
    data: {
      page:vuemodel.displayedPage,
    },
    opSuccess: function(info) {
      var taskdata = info

      if(taskdata.length==vuemodel.tasksPerPage) {
        vuemodel.moreData = true
      } else {
        vuemodel.moreData = false
      }
      if(vuemodel.displayedPage==1) {
        vuemodel.taskData = taskdata
      } else {
        vuemodel.taskData = vuemodel.taskData.concat(taskdata)       
      }
    },
  })
}
</script>

<style>
@media screen and (max-width: 767px) {
#newtask-wrapper {
  text-align: center;
}
}
</style>
