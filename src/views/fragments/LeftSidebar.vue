<script setup lang="ts">
import * as RemoteApi from "@/utils/api";
import { __LITE_CONFIG__ } from "@/config";

const side = __LITE_CONFIG__.side;
const router = useRouter();

function nav(path: string, out?: boolean) {
  if (out) window.open(path, "__blank");
  else router.push(path);
}

let tags = <any>[];
let blogger = <any>[];
let blogInfo = <any>[];
let toplist = <any>[];
let categories = <any>[];
let rank = <any>[];

RemoteApi.getSideBloggerInfoLocal(res => {
  blogger = res;
  RemoteApi.getSideBlogInfoLocal(res => {
    blogInfo = res;
    RemoteApi.getSideCategoriesLocal(res => {
      tags = res.tags;
      categories = res.categories;
      RemoteApi.getSideTopListLocal(res => {
        toplist = res;
        RemoteApi.getSideBlogRank(res => {
          rank = res;
        });
      });
    });
  });
});

const tabName = ref("随笔");
</script>

<template>
  <div class="left-side">
    <Card padding="1px 20px">
      <SideItem class="blogger" text="博客信息">
        <template #icon>
          <el-icon style="margin-right: 5px">
            <i-ep-house />
          </el-icon>
        </template>
        <div v-if="side?.avatar" class="avatar">
          <el-tooltip effect="dark" placement="right">
            <img alt="FAILED" :src="side?.avatar" />
            <template #content>
              <div v-if="side?.signature" v-html="side.signature" />
              <div v-else>这个人很懒，什么也没有留下</div>
            </template>
          </el-tooltip>
        </div>
        <div class="item" v-for="(item, index) in blogger" :key="index">
          <div class="text" @click="nav(item.href, true)">
            <div v-if="index === 0">
              <el-icon class="icon">
                <i-ep-user-filled />
              </el-icon>
              昵称：{{ item.text }}
            </div>
            <div v-if="index === 1">
              <el-icon class="icon">
                <i-ep-clock />
              </el-icon>
              园龄：{{ item.text }}
            </div>
            <div v-if="index === 2">
              <el-icon class="icon">
                <i-ep-star-filled />
              </el-icon>
              粉丝：{{ item.text }}
            </div>
            <div v-if="index === 3">
              <el-icon class="icon">
                <i-ep-bell-filled />
              </el-icon>
              关注：{{ item.text }}
            </div>
          </div>
        </div>
        <el-tooltip effect="dark" placement="bottom">
          <template #content>
            <span style="margin-right: 8px" v-for="(item, index) in rank" :key="index"> {{ item.text }} - {{ item.digg }} </span>
          </template>
          <div class="blog-data">
            <span v-for="(item, index) in blogInfo" :key="index">{{ item.text }} - {{ item.digg }}</span>
          </div>
        </el-tooltip>
      </SideItem>
      <el-tabs type="card" v-model="tabName">
        <el-tab-pane label="随笔" name="随笔">
          <template #label>
            <div class="align-center justify-center">
              <el-icon style="margin-right: 5px">
                <i-ep-folder />
              </el-icon>
              <div>随笔</div>
            </div>
          </template>
          <div class="item" v-for="(item, index) in categories" :key="index">
            <div class="text" @click="nav('/c/' + item.id + '/1')">
              {{ item.text }}
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="标签" name="标签">
          <template #label>
            <div class="align-center justify-center">
              <el-icon style="margin-right: 5px">
                <i-ep-collection-tag />
              </el-icon>
              <div>标签</div>
            </div>
          </template>
          <div class="item" v-for="(item, index) in tags" :key="index">
            <div class="text" @click="nav('/t/' + item.id)">
              {{ item.text }}
            </div>
          </div>
          <div class="item">
            <div class="text" @click="nav('/tags')">更多...</div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <SideItem text="阅读排行榜">
        <template #icon>
          <el-icon style="margin-right: 5px">
            <i-ep-d-caret />
          </el-icon>
        </template>
        <div class="item" v-for="(item, index) in toplist" :key="index">
          <div class="text" @click="nav('/e/' + item.id)">
            {{ item.text }}
          </div>
        </div>
      </SideItem>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.left-side {
  color: #878787;
  position: absolute;
  top: 10vh;
  left: 10vw;
  width: 13.5vw;
  height: 90vh;
  background-color: #252525;
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a7a7a7;
  }

  .blogger {
    margin-bottom: 20px;

    .avatar {
      margin: 20px 0;
      @include flex();

      img {
        width: 80px;
        height: 80px;
        border-radius: 50px;
        object-fit: cover;
        cursor: pointer;
      }
    }

    .blog-data {
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;

      span {
        margin-right: 8px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .item {
    margin: 10px 0;
    font-size: 14px;
    word-break: break-all;

    .text {
      cursor: pointer;
      @include ahover();
    }
  }
}
</style>
