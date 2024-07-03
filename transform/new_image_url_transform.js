import { getImageURL } from "../Utlis/helpers.js";

class NewsApiTransform {
  static transform(news) {
    return {
      id: news?.id,
      heading: news?.title,
      news: news?.content,
      image: getImageURL(news?.image),
      createdAt: news?.createdAt,
      reporter: {
        id: news?.user?.id,
        name: news?.user?.name,
        profile:
          news?.user?.profile !== null
            ? getImageURL(news?.user?.profile)
            : "https://www.w3schools.com/w3images/avatar6.png",
      },
    };
  }
}
export default NewsApiTransform;
