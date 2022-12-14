<script setup lang="ts">
import * as Api from "@/utils/api";
import * as DataType from "@/types/data-type";
import { closeLoader } from "@/utils/loader";
import { __LITE_CONFIG__ } from "@/config";

const route = useRoute();
const router = useRouter();
const postId: number = parseInt(String(route.params.id));

let essay = ref<DataType.Essay>();
let prevNext = ref<any>();
let essayVote = ref<DataType.BlogEssayVote>();
let tagscatoies = ref<any>({ categories: {}, tags: {} });

let holeSkeleton = ref(true);

Api.getEssay(postId, res => {
  essay.value = res;
  Api.getEssayTagsAndCategories(postId, res => {
    tagscatoies.value = res;
    holeSkeleton.value = false;
    closeLoader();
    Api.getPrevNext(postId, res => {
      prevNext.value = res;
      Api.getEssayVote([postId], res => {
        essayVote.value = res[0];
      });
    });
  });
});

let fontSize = ref(16);

function zoomIn() {
  fontSize.value >= 24 ? (fontSize.value = 16) : fontSize.value++;
}

function nav(path: string, out?: boolean) {
  if (out) window.open(path, "_blank");
  else router.push(path);
}

function voteEssay(voteType: DataType.VoteType) {
  Api.voteEssay({ postId, isAbandoned: false, voteType }, ajax => {
    if (ajax.isSuccess) {
      if (voteType == "Bury") essayVote.value!.buryCount = essayVote.value!.buryCount! + 1;
      else essayVote.value!.diggCount = essayVote.value!.diggCount! + 1;
    }
    ElMessage({ message: ajax.message, grouping: true, type: ajax.isSuccess ? "success" : "error" });
  });
}
</script>

<template>
  <div class="essay">
    <Card class="essay__packer" padding="20px 20px" margin="0 10px 12px 10px">
      <el-skeleton style="margin-top: 10px" :rows="20" animated :loading="holeSkeleton" />
      <div v-if="!holeSkeleton">
        <el-page-header @back="nav('/')">
          <template #icon>
            <i-ep-arrow-left />
          </template>
          <template #content>
            <div class="title">{{ essay?.text }}</div>
          </template>
        </el-page-header>
        <div class="head-info">
          <div class="date">
            <el-icon>
              <i-ep-clock />
            </el-icon>
            <span>{{ essay?.date }}</span>
          </div>
          <div class="view-count">
            <el-icon>
              <i-ep-view />
            </el-icon>
            <span>{{ essay?.view }}?????????</span>
          </div>
          <div class="comm-count">
            <el-icon>
              <i-ep-chat-line-square />
            </el-icon>
            <span>{{ essay?.comm }}?????????</span>
          </div>
          <div class="zoom-in" @click="zoomIn">
            <el-icon>
              <i-ep-zoom-in />
            </el-icon>
            <span>??????</span>
          </div>
          <div
            class="edit-essay"
            v-if="__LITE_CONFIG__.isBlogOwner"
            @click="nav('https://i.cnblogs.com/EditPosts.aspx?postid=' + postId, true)">
            <el-icon>
              <i-ep-edit-pen />
            </el-icon>
            <span>??????</span>
          </div>
        </div>
        <div class="labels">
          <div class="categories" v-if="tagscatoies.categories.length > 0">
            <div class="caption">
              <el-icon>
                <i-ep-folder-opened />
              </el-icon>
              <span>?????????</span>
            </div>
            <div class="item" v-for="(item, index) in tagscatoies.categories" :key="index">
              <Tag :color="item.color" @click="nav('/c/' + item.href + '/1')">
                {{ item.text }}
              </Tag>
            </div>
          </div>
          <div class="tags" v-if="tagscatoies.tags.length > 0">
            <div class="caption">
              <el-icon>
                <i-ep-price-tag />
              </el-icon>
              <span>?????????</span>
            </div>
            <div class="item" v-for="(item, index) in tagscatoies.tags" :key="index">
              <Tag :color="item.color" @click="nav('/t/' + item.text)">
                {{ item.text }}
              </Tag>
            </div>
          </div>
        </div>
        <div class="essay-content" :style="{ 'font-size': fontSize + 'px' }" v-parse-code="true" v-html="essay?.content" />
        <div class="divider"></div>
        <div class="tail-info">
          <div class="date">
            <el-icon>
              <i-ep-clock />
            </el-icon>
            <span>{{ essay?.date }}</span>
          </div>
          <div class="view-count">
            <el-icon>
              <i-ep-view />
            </el-icon>
            <span>{{ essay?.view }}?????????</span>
          </div>
          <div class="comm-count">
            <el-icon>
              <i-ep-chat-line-square />
            </el-icon>
            <span>{{ essay?.comm }}?????????</span>
          </div>
        </div>
        <div class="prev-next">
          <div class="prev" v-if="prevNext?.prev?.href">
            <el-icon>
              <i-ep-d-arrow-left />
            </el-icon>
            <a :href="prevNext.prev.href">????????????{{ prevNext.prev.text }}</a>
          </div>
          <div class="next" v-if="prevNext?.next?.href">
            <el-icon>
              <i-ep-d-arrow-right />
            </el-icon>
            <a :href="prevNext.next.href">????????????{{ prevNext.next.text }}</a>
          </div>
        </div>
        <div class="vote-essay">
          <div class="digg">
            <el-button style="color: #a7a7a7" plain @click="voteEssay('Digg')">
              ?????? {{ essayVote?.diggCount }}
              <template #icon>
                <i-ep-caret-top />
              </template>
            </el-button>
          </div>
          <div class="bury">
            <el-button style="color: #a7a7a7" plain @click="voteEssay('Bury')">
              ?????? {{ essayVote?.buryCount }}
              <template #icon>
                <i-ep-caret-bottom />
              </template>
            </el-button>
          </div>
        </div>
        <Comments :post-id="postId" />
      </div>
    </Card>
  </div>
</template>

<style lang="scss">
h1,
h2,
h3 {
  font-weight: 400 !important;
}

h1 {
  font-size: 21px !important;
}

h2 {
  font-size: 19px !important;
}

h3 {
  font-size: 18px !important;
}

h4 {
  font-size: 17px !important;
}

h5 {
  font-size: 17px !important;
}

h6 {
  font-size: 17px !important;
}

pre {
  border-radius: 6px;
  position: relative;
  box-sizing: border-box;

  code {
    font-family: Consolas, serif;
    font-weight: 300;
    font-size: 15px;
    margin: 0 !important;
    border-radius: 6px;
    background-color: #2b2b2b !important;

    &::-webkit-scrollbar {
      display: none;
      width: 3px;
      height: 3px;
    }

    &:hover::-webkit-scrollbar {
      display: block;
      width: 3px;
      height: 3px;
    }

    &,
    span {
      line-height: 1.3;
      letter-spacing: 1px;
      word-break: break-all;
    }
  }
}

code {
  font-family: Consolas, serif;
  font-size: 14px;
  font-weight: 300;
  background: #2e2e2e;
  color: var(--el-color-danger-light-3);
  padding: 3px 6px;
  border-radius: 6px;
  word-break: break-all;
  margin: 0 4px;
  box-sizing: border-box;
}

.code-type {
  box-sizing: border-box;
  padding: 4px;
  font-size: 13px;
  color: #6d6d6d;
  font-weight: 300;
  font-family: sans-serif;
  position: absolute;
  right: 4px;
  top: 0;
}

.cust-img {
  border-radius: 6px;
  max-width: 100%;
  object-fit: cover;
}

.essay-content {
  @mixin font() {
    letter-spacing: 1.2px;
    word-break: break-all;
    @content;
  }

  a {
    padding-bottom: 1px;
    border-bottom: 1px dotted #a7a7a7;

    @include ahover() {
      border-bottom: 1px dotted var(--el-color-primary);
    }
  }

  p {
    margin: 8px 0 !important;

    @include font() {
      line-height: 1.7;
    }
  }

  ol,
  ul {
    li {
      @include font() {
        line-height: 1.5;
      }
    }

    li:last-child {
      margin-bottom: 0;
    }
  }

  table {
    padding: 10px;
    box-sizing: border-box;

    th,
    td {
      padding: 8px 13px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    tbody {
      tr:nth-child(even) {
        background-color: #2b2b2b;
      }
    }
  }
}

.el-page-header__left {
  margin-right: 0 !important;
}
</style>

<style lang="scss">
$color: #a7a7a7;

.essay {
  color: $color;

  .essay__packer {
    position: relative;
  }

  .title {
    line-height: 1.3;
    color: $color !important;
    word-break: break-all;
    font-size: 24px;
  }

  .head-info {
    @include flex($justify: flex-start);
  }

  .labels {
    font-size: 14px;
    margin: 25px 0;

    .categories {
      margin-bottom: 8px;
    }

    .categories,
    .tags {
      @include flex($justify: flex-start);

      .caption {
        @include flex();

        span {
          margin-left: 4px;
        }
      }

      .item {
        margin-right: 4px;
      }

      .item:last-child {
        margin-left: 0;
      }
    }
  }

  .divider {
    margin: {
      top: 50px;
      left: 0;
      right: 0;
      bottom: 10px;
    }
    border: {
      top: 0;
      left: 0;
      right: 0;
      bottom: 1px;
      style: dashed;
      color: #444444;
    }
  }

  .tail-info {
    @include flex($justify: flex-end);
  }

  .prev-next {
    font-size: 14px;
    margin-top: 40px;

    a {
      color: #878787;
      margin-left: 6px;
      @include ahover();
    }

    .prev,
    .next {
      @include flex($justify: flex-start);
    }

    .prev {
      @include ahover();
    }

    .next {
      @include ahover();
      margin-top: 10px;
    }
  }

  .vote-essay {
    @include flex($justify: flex-end);
    margin: 35px 0;

    .digg {
      margin-right: 30px;
    }
  }

  .head-info,
  .tail-info {
    font-size: 14px;
    margin-top: 20px;

    div:last-child {
      margin-right: 0 !important;
    }

    div > span {
      user-select: none;
      margin-left: 6px;
    }

    .date {
      @include flex();
    }

    .edit-essay,
    .zoom-in {
      cursor: pointer;
    }

    .date,
    .view-count,
    .edit-essay,
    .zoom-in,
    .comm-count {
      margin-right: 10px;
    }

    .view-count,
    .comm-count,
    .edit-essay,
    .zoom-in {
      @include flex();
    }
  }

  .head-info,
  .labels,
  .tail-info,
  .prev-next {
    color: #878787;
  }
}
</style>
