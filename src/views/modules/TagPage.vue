<script setup lang="ts">
import * as Api from "@/utils/api";
import { closeLoader } from "@/utils/loader";

const route = useRoute();

let taglist = ref<any>();
let tagname = "";
let loading = ref(true);

function fetchTagPageList() {
  Api.getTagPageList(String(route.params.tag), res => {
    tagname = res.text;
    taglist.value = res.list;
    loading.value = false;
    closeLoader();
  });
}

watch(route, () => {
  loading.value = true;
  fetchTagPageList();
});

fetchTagPageList();
</script>

<template>
  <div class="tagpage">
    <div class="tagname">{{ tagname }}</div>
    <div class="taglist">
      <Card v-if="loading" class="item" v-for="item in 10" :key="item" width="auto" height="auto" margin="5px">
        <el-skeleton animated :loading="loading"></el-skeleton>
      </Card>
      <Card v-if="!loading" class="item" v-for="(item, index) in taglist" :key="index" width="auto" height="auto" margin="5px">
        <div class="name">
          <router-link :to="'/e/' + item.id">{{ item.title }}</router-link>
        </div>
        <div class="browse">
          <el-icon>
            <i-ep-caret-right />
          </el-icon>
          <router-link :to="'/e/' + item.id">阅读全文</router-link>
        </div>
        <div class="desc">
          <EssayBottom :data="{ date: item.date, view: item.view, comm: item.comm, digg: item.digg }" />
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tagpage {
  .tagname {
    font-size: 20px;
    margin: 10px 20px 10px 5px;
  }

  .taglist {
    @include flex($justify: space-between, $items: stretch, $content: stretch);

    .item {
      flex: 1 1 40%;

      .name {
        font-size: 20px;
        word-break: break-all;

        a {
          @include ahover();
        }
      }

      .browse {
        font-size: 14px;
        margin-top: 20px;
        @include flex($justify: flex-start);

        a {
          border-bottom: 1px dotted #cccccc;
          padding-bottom: 2px;

          @include ahover() {
            border-bottom: 1px dotted var(--el-color-primary);
          }
        }
      }

      .desc {
        font-size: 14px;
        word-break: break-all;
        margin-top: 20px;
      }
    }
  }
}
</style>
