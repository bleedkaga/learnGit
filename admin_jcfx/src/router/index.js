import Vue from 'vue'
import Router from 'vue-router'
import NProgress from 'nprogress'


import Hello from '@/components/slider'
import login from '@/components/login'
import dataShow from '@/components/datashow'
import parkingSet from '@/components/parking-set'
import charging from '@/components/charging'
import rechargeActivitySetting from '@/components/rechargeActivitySetting'
import invoiceManagement from '@/components/invoice-management'
import fixedParkingSetting from '@/components/fixed_parking_setting'
import integratedQuery from '@/components/integrated_query'
import siteQuery from '@/components/integrated_query/site'
import record from '@/components/integrated_query/record'
import order from '@/components/integrated_query/order'
import bookOrder from '@/components/integrated_query/book_order'
import baseSetting from '@/components/base-setting'
import magneticManagement from '@/components/magnetic/magnetic-management'
import earth from '@/components/earthManagement/earth'
import parkingLock from '@/components/earthManagement/parking-lock'
import gateway from '@/components/earthManagement/gateway'

import parkingLockPassword from '@/components/earthManagement/parkingLockPassword'
import position from '@/components/earthManagement/positioning'
import log from '@/components/log/log'
import passwordCover from '@/components/password-cover'
import user from '@/components/user/user'
import feedback from '@/components/message/feedback'
import history from '@/components/message/history'
import messagePush from '@/components/message/push'
import adminAccount from '@/components/permission/account'
import role from '@/components/permission/role'

import banner from '@/components/earthManagement/banner'

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            component: Hello,
            children: [
            {
                path: "",
                redirect: '/datashow'
            },
            {
                path: "/datashow",
                name: 'datashow',
                component: dataShow
            }, {
                path: '/dataReport',
                name: 'dateReport',
                component: resolve => require(['@/components/dataStatistics/Report'], resolve)
            }, {
                path: '/parkingtime',
                name: 'parking-time',
                component: resolve => require(['@/components/dataStatistics/ParkingTime'], resolve)
            }, {
                path: '/parkinglockMaintain',
                name: 'parkinglockMaintain',
                component: resolve => require(['@/components/dataStatistics/parkinglockMaintain'], resolve)
            }, {
                path: '/parking-set',
                name: 'parking-set',
                component: parkingSet
            }, {
                path: '/charging',
                name: 'charging',
                component: charging
            }, {
                path: '/recharge-activity-setting',
                name: 'recharge',
                component: rechargeActivitySetting
            }, {
                path: '/invoice',
                name: 'invoice',
                component: invoiceManagement
            }, {
                path: '/fixed_parking_setting',
                name: 'fixedParkingSetting',
                component: fixedParkingSetting
            }, {
                path: '/integrated_query',
                name: 'integreted_query',
                component: integratedQuery,
                children: [{
                    path: 'site',
                    name: '',
                    component: siteQuery
                }, {
                    path: 'record',
                    name: '',
                    component: record
                }, {
                    path: 'order',
                    name: '',
                    component: order
                }, {
                    path: 'book_order',
                    name: '',
                    component: bookOrder
                }]
            }, {
                path: 'base-setting',
                name: '',
                component: baseSetting
            }, {
                path: 'earth',
                name: 'earth',
                component: earth
            }, {
                path: 'parking-lock',
                name: 'parkingLock',
                component: parkingLock
            }, {
                path: 'parking-lock-password',
                name: 'parkingLockPassword',
                component: parkingLockPassword
            }, {
                path: 'gateway',
                name: 'gateway',
                meta: {
                  path_name: '网关管理'
                },
                component: gateway
            }, {
                path: 'banner',
                name: 'banner',
                component: banner
            }, {
                path: 'positioning',
                name: 'positioning',
                component: position
            }, {
                path: 'log',
                name: 'log',
                component: log
            }, {
                path: 'role',
                name: 'role',
                component: role
            }, {
                path: 'admin-account',
                name: 'adminAccount',
                component: adminAccount
            }, {
                path: 'message-push',
                name: 'messagePush',
                component: messagePush
            }, {
                path: 'history',
                name: 'history',
                component: history
            }, {
                path: 'feedback',
                name: 'feedback',
                component: feedback
            }, {
                path: 'user',
                name: 'user',
                component: user
            }]
        },

        {
            path: '/login',
            name: 'login',
            component: login
        },
        {
            path: '/password-cover',
            name: 'repassword',
            component: passwordCover
        }
    ]
})

router.beforeEach((to, from, next) => {
    NProgress.done().start()
    let toName = to.name;
    let fromName = from.name;
    let loginState = sessionStorage.getItem('user');
    if( !loginState && toName !== 'login' ){
      next({
          path: '/login'
      })
    } else {

      var  is_login;
      try{
        is_login = JSON.parse(sessionStorage.getItem('user')).admin.login;
      } catch(e){
        is_login = false
      }

      if (!is_login && toName !== 'login') {
          next({
              path: '/login'
          })
      } else {
          if (is_login && toName === 'login') {
              next({
                  path: '/login'
              })
          } else {
              next()
          }

      }
    }

})

router.afterEach(route => {
    NProgress.done()
})

export default router;
