/**
 * 提供解析博客园 HTML 或字符 HTML 的各种基础 API
 *
 * @author Himmelbleu
 * @since 1.0
 * @date 2022 年 12 月 1 日
 * @url https://www.cnblogs.com/Himmelbleu/#/
 */

import $ from "jquery";
import * as TextUtils from "./text-helper";
import * as DataType from "@/types/data-type";
import { parseUnit } from "./numeric-helper";

/**
 * 由于一些问题，有时候请求过来的 DOM 不是真实的 DOM，所以不能被 JQ 解析，必须先调用该函数进行转换
 *
 * @param strDOM 被解析成 DOM 树的对象
 * @returns 返回一个真实的 DOM 树
 */
export function parseStrToDom(strDOM: any) {
  return new DOMParser().parseFromString(strDOM, "text/html");
}

function calcPages(sorter: any, calc: boolean): string[] {
  let pages: string[] = [];
  if (calc && sorter) {
    if ($(sorter).length > 1) {
      $(sorter).each((i, e) => {
        let text = $(e).text();
        if (!(/下一页/g.test(text) || /上一页/g.test(text))) {
          pages.push(text);
        }
        // if (i != 0 && (i != $(sorter).length - 1 || $(sorter).length - 1 === 1)) pages.push($(e).text());
      });
    }
  } else {
    pages.push("Do not calculate pages.");
  }
  return pages;
}

/**
 * 解析随笔列表页面
 *
 * @param realDOM 不知道什么原因，该接口获取到传递下来的 DOM 是能够被 jQuery 解析的，所以不需要调用 parseStrToDom 函数。
 * @param calc 是否继续计算随笔列表页数，一般第一次调用该 API 时设置 true，目的是获取随笔列表的页数情况，再换页之后继续调用该
 * API 时不推荐再开启，设置为 false，避免破坏翻页时分页组件的 total 值。
 */
export function parseEssayList(realDOM: any, calc: boolean): { pages: string[]; list: Array<DataType.Essay> } {
  let id = $(realDOM).find(".postTitle2");
  let title = $(realDOM).find(".postTitle");
  let describe = $(realDOM).find(".c_b_p_desc");
  let record = $(realDOM).find(".postDesc").text();
  let date = record.match(/[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d/g);
  let view = record.match(/阅读\([0-9]+\)/g);
  let comm = record.match(/评论\([0-9]+\)/g);
  let digg = record.match(/推荐\([0-9]+\)/g);

  let list: Array<DataType.Essay> = [];
  $(describe).each((i, e) => {
    let surface = $(e).find(".desc_img").attr("src");
    list.push({
      id: parseInt(
        $(id[i])
          .attr("href")!
          .match(/[0-9]+/g)![0]
      ),
      text: $(title[i]).text().trim(),
      desc: TextUtils.regTrim($(describe[i]).text(), [/阅读全文/g]),
      date: date![i],
      view: view![i],
      comm: comm![i],
      digg: digg![i],
      surface: surface || ""
    });
  });

  return { pages: calcPages($(realDOM).find("#homepage_top_pager > .pager > a"), calc), list };
}

/**
 * 解析随笔详细页面
 *
 * @param postId 随笔 ID
 * @param realDOM 请求响应消息
 */
export function parseEssay(postId: number, realDOM: any): DataType.Essay {
  return {
    id: postId,
    text: $(realDOM).find(".postTitle > a > span").text(),
    content: $(realDOM).find("#cnblogs_post_body").html(),
    date: $(realDOM).find("#post-date").text(),
    view: $(realDOM).find("#post_view_count").text(),
    comm: $(realDOM).find("#post_comment_count").text()
  };
}

/**
 * 解析随笔详细页面的评论列表
 *
 * \(/)[a-zA-Z\d\u4e00-\u9fa5_-]{1,}(/)\g
 *
 * @param strDOM 同样的也需要先调用 dom 函数转换成 DOM 树
 */
export function parseCommentList(strDOM: any): Array<DataType.Comment> {
  let comments: Array<DataType.Comment> = [];

  $(parseStrToDom(strDOM))
    .find(".feedbackItem")
    .map((i, elem) => {
      let anchor = $(elem).find(".layer").attr("href")!.split("#")[1];
      comments[i] = {
        updateEditable: false,
        replayEditable: false,
        commentId: parseInt(anchor),
        space: $(elem).find(`#a_comment_author_${anchor}`).attr("href"),
        author: $(elem).find(`#a_comment_author_${anchor}`).text(),
        layer: $(elem).find(".layer").text(),
        date: $(elem).find(".comment_date").text(),
        content: $(elem).find(`#comment_body_${anchor}`).html(),
        digg: $(elem).find(".comment_digg").text().trim(),
        bury: $(elem).find(".comment_burry").text().trim(),
        avatar: $(elem).find(`#comment_${anchor}_avatar`).text().trim()
      };
    });

  return comments;
}

/**
 * 解析评论数量，官方默认一页是 50 条，pageIndex = 0 开始
 *
 * 40 / 50 = 0.8 意思还是第一页，100 / 50 = 2，刚好第二页，因此除了之后是一个向上取整的
 *
 * @param json 评论数量计数
 * @returns 返回一共有多少个 pageIndex
 */
export function parseCommentPages(json: any): number {
  return Math.ceil(parseInt(json) / 50);
}

/**
 * 解析随笔详细页面中的标签和分类
 *
 * @param strDOM 同样的也需要先调用 dom 函数转换成 DOM 树
 */
export function parseEssayTagsAndCategories(strDOM: any): any {
  let list = <any>{ tags: [], categories: [] };
  let dom = parseStrToDom(strDOM);

  $(dom)
    .find("#BlogPostCategory > a")
    .map((i, d) => {
      list.categories[i] = {
        href: $(d)
          .attr("href")!
          .match(/\/category\/\d+/g)![0]
          .split("/")[2]
          .split(",")[0],
        text: $(d).text()
      };
    });

  $(dom)
    .find("#EntryTag > a")
    .map((i, d) => {
      list.tags[i] = {
        text: $(d).text()
      };
    });

  return list;
}

/**
 * 解析上下篇随笔
 *
 * @param strDOM 同样的也需要先调用 dom 函数转换成 DOM 树
 */
export function parsePrevNext(strDOM: any): any {
  let _dom = parseStrToDom(strDOM);
  let prevNext = { prev: {}, next: {} };

  $(_dom)
    .find("a")
    .each((i, e) => {
      let prefix = $(e).text().trim();
      if (prefix == "«") {
        prevNext["prev"] = {
          text: $(e).next("a").text(),
          href: $(e).next("a").attr("href")
        };
      } else if (prefix == "»") {
        prevNext["next"] = {
          text: $(e).next("a").text(),
          href: $(e).next("a").attr("href")
        };
      }
    });

  return prevNext;
}

/**
 * 解析分类列表页面
 *
 * @param realDOM 真实 DOM
 * @param calc 是否计算页数
 */
export function parseCategoryList(realDOM: any, calc: boolean): { pages: string[]; label: string; list: Array<DataType.Essay> } {
  let dom = $(realDOM).find(".entrylistItem");

  let id = $(dom).find(".entrylistItemTitle");
  let title = $(dom).find(".entrylistItemTitle > span");
  let describe = $(dom).find(".c_b_p_desc");
  let record = $(dom).find(".entrylistItemPostDesc").text();
  let date = record.match(/[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d/g);
  let view = record.match(/阅读\([0-9]+\)/g);
  let comm = record.match(/评论\([0-9]+\)/g);
  let digg = record.match(/推荐\([0-9]+\)/g);

  let list: Array<DataType.Essay> = [];
  $(dom).each((i, e) => {
    let surface = $(e).find(".c_b_p_desc > .desc_img").attr("src");
    list.push({
      id: parseInt(
        $(id[i])
          .attr("href")!
          .match(/[0-9]+/g)![0]
      ),
      text: $(title[i]).text(),
      desc: $(describe[i]).text(),
      date: date![i],
      view: view![i],
      comm: comm![i],
      digg: digg![i],
      surface: surface ? surface : ""
    });
  });

  return {
    pages: calcPages($(realDOM).find("#mainContent .pager")[0]?.querySelectorAll("a"), calc),
    list,
    label: $(realDOM).find(".entrylistTitle").text() || ""
  };
}

/**
 * 解析标签页下的随笔列表
 *
 * @param realDOM 真实 DOM
 */
export function parseTagPageList(realDOM: any): DataType.TagPage {
  let title = $(realDOM).find(".PostList > .postTitl2 > a");
  let describe = $(realDOM).find(".PostList > .postDesc2");
  let tagTitle = $(realDOM).find(".PostListTitle").text().trim();
  let list: any = [];

  $(title).each((i, e) => {
    list[i] = {
      id: parseInt(
        $(e)
          .attr("href")!
          .match(/[0-9]+/g)![0]
      ),
      title: $(e).text().trim(),
      href: $(e).attr("href"),
      date: $(describe[i])
        .text()
        .match(/[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d/g)![0],
      view: $(describe[i]).find(".post-view-count").text().split(":")[1],
      comm: $(describe[i]).find(".post-comment-count").text().split(":")[1],
      digg: $(describe[i]).find(".post-digg-count").text().split(":")[1]
    };
  });

  return {
    list,
    text: tagTitle
  };
}

/**
 * 解析侧边栏随笔分类列表
 *
 * @param strDOM 真实 DOM
 */
export function parseSideCategories(strDOM: string): any {
  let dom = parseStrToDom(strDOM);
  let list: any = { categories: [], tags: [] };

  let tags = $(dom).find("#sidebar_toptags ul li > a");
  for (let i = 0; i < $(tags).length; i++) {
    let uri = $(tags[i]).attr("href");
    if (uri) {
      let decode = decodeURI(uri).match(/\/tag\/[\w\s\u4e00-\u9fa5\n.\-|_]+/g);
      if (decode) list.tags[i] = { id: decode[0].split("/")[2], text: $(tags[i]).text() };
    }
  }

  let li = $(dom).find("#sidebar_postcategory > ul > li > a");
  $(li).each((i, e) => {
    list.categories.push({
      id: $(e)
        .attr("href")!
        .match(/[0-9]+/g)![0],
      text: $(e).text()
    });
  });

  return list;
}

/**
 * 解析侧边栏博主信息
 *
 * @param strDOM 真实 DOM
 */
export function parseSideBloggerInfo(strDOM: string): Array<DataType.BloggerInfo> {
  let list: Array<DataType.BloggerInfo> = [];
  let a = $(parseStrToDom(strDOM)).find("#profile_block > a");
  $(a).each((i, e) => {
    list.push({ text: $(e).text().trim(), href: $(e).attr("href")! });
  });
  return list;
}

/**
 * 解析博客信息
 *
 * @param strDOM 真实 DOM
 */
export function parseSideBlogInfo(strDOM: string): any {
  let list = <any>[];
  $(parseStrToDom(strDOM))
    .find("span")
    .each((i, d) => {
      if ($(d).attr("id")) {
        let t = $(d).text();
        let text = t.match(/^[\u4e00-\u9fa5]*/g)[0];
        let digg = t.match(/\d+/g)[0];
        if (i === 3) digg = parseUnit(digg);
        list.push({ text, digg });
      }
    });
  return list;
}

/**
 * 忽哟去侧边栏博客排行信息。
 *
 * @param strDOM 真实 DOM
 */
export function parseSideRank(strDOM: string): any[] {
  let list = <any>[];
  $(parseStrToDom(strDOM))
    .find("li")
    .each((i, d) => {
      let t = $(d).text().trim();
      let text = t.match(/^[\u4e00-\u9fa5]*/g)[0];
      let digg = t.match(/\d+/g)[0];
      list.push({ text, digg });
    });
  return list;
}

/**
 * 解析博客阅读排行榜
 *
 * @param strDOM 真实 DOM
 */
export function parseSideBlogTopList(strDOM: string): any {
  let list = <any>[];
  $(parseStrToDom(strDOM))
    .find("#TopViewPostsBlock ul > li > a")
    .each((i, e) => {
      list.push({
        id: $(e)
          .attr("href")
          ?.match(/\/p\/\d+/g)![0]
          .split("/")[2],
        text: TextUtils.regTrim($(e).text().trim(), [/\n+/g])
      });
    });
  return list;
}
