<template>
  <div class="login-container">
    <section class="login-container_header">
      <span class="agent—login-btn" @click="onClick_agentLogin">代理商登陆</span>
      <language-selector />
    </section>
    <div class="form-wrap">
      <div class="inner">
        <el-form ref="loginForm" :model="loginForm" :rules="!isAgent?loginRules:agentRules" class="login-form" auto-complete="on" label-position="left">
          <div class="login-logo">
            <img src="../../assets/images/login/logo.png" alt="">
          </div>
  
          <div class="title-container">
            <h3 class="title">{{!isAgent ? '云易绣商家后台' : '云易绣代理商' }}{{ $t('登录') }}</h3>
          </div>
    
          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              :placeholder="$t('用户名')"
              name="username"
              type="text"
              tabindex="1"
              auto-complete="off"
            />
          </el-form-item>
    
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              :placeholder="$t('登录密码')"
              name="password"
              tabindex="2"
              auto-complete="off"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>

          <el-form-item prop="code" v-if="!isAgent">
            <span class="svg-container">
              <svg-icon icon-class="vercode" />
            </span>
            <el-input
              ref="code"
              v-model="loginForm.code"
              :placeholder="$t('验证码')"
              name="code"
              tabindex="3"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd">
              <img ref="codeImg" src="" alt="" @click="changeCode">
            </span>
          </el-form-item>
          <div class="submit-btn">
            <el-button class="login-btn" :loading="loading" type="primary"  @click.native.prevent="handleLogin">{{ $t('立即登录') }}</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <footer>
      <div class="beian">
        <a href="http://beian.miit.gov.cn/" style="color:rgb(85, 26, 139)">浙ICP备18026418号-1号</a>
         ｜ Copyright © 云易绣 版权归易绣（诸暨）科技有限公司所有
      </div>
    </footer>
  </div>
</template>

<script>
// import { validUsername } from '@/utils/validate'
import LanguageSelector from '@/components/LanguageSelector'
export default {
  name: 'Login',
  components: {
    LanguageSelector
  },
  data() {
    // const validateUsername = (rule, value, callback) => {
    //   if (!validUsername(value)) {
    //     callback(new Error('Please enter the correct user name'))
    //   } else {
    //     callback()
    //   }
    // }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error(`${this.$t('密码不能小于1位')}`))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        code: ''
      },
      baseUrl: process.env.VUE_APP_BASE_API,
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: `${this.$t('用户名不能为空')}` }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        code: [{ required: true, trigger: 'blur', message: `${this.$t('验证码不能为空')}` }]
      },
      agentRules: {
        username: [{ required: true, trigger: 'blur', message: `${this.$t('用户名不能为空')}` }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      isAgent: false
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  mounted() {
    this.changeCode()
  },

  methods: {
    onClick_agentLogin() {
      this.isAgent = true;
    },
    changeCode() {
      const captcha_key = this.getCaptchaKey()
      this.loginForm.captcha_key = captcha_key
      this.$refs.codeImg.setAttribute(
        'src',
        this.baseUrl + '/admin/getCaptcha?a=' +
           captcha_key
      )
    },
    getCaptchaKey() {
      const captchaKey = Math.random()
        .toString(36)
        .substring(2)
      return captchaKey
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const k = !this.isAgent ? 'user/login' : 'user/loginAgent'
          this.$store.dispatch(k, this.loginForm).then(() => {
            // 获取用户数据
            // this.$store.dispatch('user/getInfo')
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #888686;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  &_header {
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 30px;
    box-sizing: border-box;
    .el-dropdown-link {
      color: #fff;
      .svg-icon {
        vertical-align: -.25em;
        color: #fff
      }
    }
  }
  .el-input {
    display: inline-block;
    /* height: 50px; */
    font-size: .12rem;
    /* width: 85%!important; */
    width: 2.5rem;
    input {
      width: 2.5rem;
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: .12rem .05rem .12rem .15rem;
      color: #888686;
      height: .37rem;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-form-item__content {
    line-height: normal!important;
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.55);
    border-radius: 5px;
    color: #454545;
    height: .38rem;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
$light_white:#fff;


.login-container {
  min-height: 100%;
  width: 100%;
  background-image: url('../../assets/images/login/bj_1.jpg');
  background-size: 100% 100%;
  /* background-color: $bg; */
  overflow: hidden;

  .form-wrap {
    width: 4.4rem;
    height: 5.18rem;
    background: rgba(255, 255, 255, 0.3);
    /* opacity: 0.3; */
    position: fixed;
    left: 72%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: .08rem;
    .inner {
      background: rgba(255, 255, 255, 0.5);
      width: 100%;
      height: 100%;
      width: 4.03rem;
      height: 4.82rem;
      border-radius: .08rem;
      margin: .17rem auto 0;
    }
  } 

  .login-form {
    /* position: fixed; */
    /* width: 400px; */
    width: 3.0rem;
    max-width: 100%;
    /* padding: 50px 35px 50px; */
    margin: 0 auto;
    overflow: hidden;
    /* left: 14.99rem;
    top: 50%; */
    /* background: rgba(255, 255, 255, 0.1); */
    /* transform: translate(-50%, -50%); */
    border-radius: 10px;
    .login-btn {
      background: linear-gradient(90deg,rgba(129, 209, 228, 0.35), RGBA(54, 156, 190, 0.9));
      /* background: #81D1E4; */
      border: none;
      width: 2.98rem;
      height: .4rem;
      line-height: .4rem;
      box-shadow: 0px 9px 7px 0px rgba(129, 209, 228, 0.35);
      border-radius: .2rem;
      padding: 0;
      margin-top: .22rem;
      &:hover {
        background: linear-gradient(90deg,rgba(129, 209, 228, 0.4), RGBA(54, 156, 190, 1));
      }
    }

    .login-logo {
      margin-top: .29rem;
      font-size: .12rem;
      img {
        width: .8rem;
        height: .55rem;
      }
      text-align: center;
    }

    .submit-btn {
      font-size: .12rem;
    }
  }

  .svg-container {
    padding: .06rem .05rem .06rem .15rem;
    color: $dark_gray;
    vertical-align: middle;
    width: .3rem;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      /* font-size: 26px;
      color: $light_white;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold; */
      margin: .1rem auto .4rem auto;
      font-size: .3rem;
      font-family: MicrosoftYaHei;
      font-weight: 400;
      color: #2B1E16;
      text-align: center;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    /* top: 7px; */
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
    .svg-icon {
        vertical-align: -.45em;
        /* color: #fff */
    }
    img {
      width: 1.07rem;
      height: .37rem;;
    }
  }
}

footer .beian {
  font-size: .16rem;
  font-family: MicrosoftYaHei;
  font-weight: 400;
  color: #2B1E16;
  position: fixed;
  bottom: .29rem;
  width: 100%;
  text-align: center;
}

.agent—login-btn {
  margin-top: 3px;
  margin-right: 10px;
  cursor: pointer;
  color:blueviolet;
  text-decoration: underline;
  
}
</style>
