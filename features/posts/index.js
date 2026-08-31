import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { adminPostsCategory } from "../../lib/constants";
import formatPost from "./format";
import postsKeys from "./queries";
import { WP_API } from "../../lib/wp";

export const usePosts = (filters, options) => {
  return useQuery(
    postsKeys.postsFiltered(filters),
    async () => {
      const response = await axios.get(
        `${WP_API}/posts`,
        {
          params: {
            order: "asc",
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
            per_page: 100,
            ...filters,
          },
        }
      );
      return response.data;
    },
    {
      select: (data) => data.map((post) => formatPost(post)),
      ...options,
    }
  );
};

export const useAdminCategories = (filters, options) => {
  return useQuery(
    postsKeys.categoriesFiltered(filters),
    async () => {
      const response = await axios.get(
        `${WP_API}/categories`,
        {
          params: {
            order: "asc",
            timestamp: new Date().getTime(),
            per_page: 100,
            ...filters,
          },
        }
      );
      return response.data;
    },
    {
      ...options,
    }
  );
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ name, parent }) => {
      const response = await axios.post(
        `${WP_API}/categories`,
        {
          name,
          parent,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno dodano.");
        queryClient.invalidateQueries(postsKeys.categories());
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za dodavanje.");
        else toast.error("Greška kod dodavanja.");
      },
    }
  );
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, name, parent, meta }) => {
      const response = await axios.post(
        `${WP_API}/categories/${id}`,
        {
          name,
          parent,
          meta,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno uređeno.");
        queryClient.invalidateQueries(postsKeys.categories());
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje.");
        else toast.error("Greška kod uređivanja.");
      },
    }
  );
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id }) => {
      const response = await axios.delete(
        `${WP_API}/categories/${id}`,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno obrisano.");
        queryClient.invalidateQueries(postsKeys.categories());
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje.");
        else toast.error("Greška kod brisanja.");
      },
    }
  );
};

export const usePost = (id, options) => {
  return useQuery(
    postsKeys.post(id),
    async () => {
      const response = await axios.get(
        `${WP_API}/posts/${id}`
      );
      return response.data;
    },
    {
      select: (data) => formatPost(data),
      staleTime: Infinity,
      ...options,
    }
  );
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      title,
      excerpt,
      content,
      status,
      categories,
      documents,
      slug,
      titleEn,
      excerptEn,
      contentEn,
    }) => {
      const response = await axios.post(
        `${WP_API}/posts`,
        {
          title,
          excerpt,
          content,
          status,
          slug,
          categories: [adminPostsCategory, ...categories],
          meta: {
            documents,
            title_en: titleEn,
            excerpt_en: excerptEn,
            content_en: contentEn,
          },
        }
      );
      return formatPost(response.data);
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno dodano.");
        queryClient.invalidateQueries(postsKeys.posts);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za dodavanje.");
        else toast.error("Greška kod dodavanja.");
      },
    }
  );
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      id,
      title,
      excerpt,
      content,
      status,
      featuredMedia,
      slug,
      documents,
      accordionItems,
      sadrzaj,
      kontakt,
      radno_vrijeme_blagajni,
      lokacija,
      image_groups,
      link,
      actionTitle,
      images,
      rentalOptions,
      features,
      teatarTdPhone,
      teatarTdEmail,
      teatarTdWebsiteUrl,
      teatarTdAddress,
      titleEn,
      excerptEn,
      contentEn,
      sadrzajEn,
      kontaktEn,
      radnoVrijemeBlagajniEn,
      actionTitleEn,
      accordionItemsEn,
      imageGroupsEn,
      featuresEn,
      rentalOptionsEn,
    }) => {
      const response = await axios.post(
        `${WP_API}/posts/${id}`,
        {
          title,
          excerpt,
          content,
          status,
          featured_media: featuredMedia,
          // Only send a slug when the caller actually chose one. This used to
          // be `slug || title`, which re-derived the slug from the Croatian
          // title on every save — so editing a title silently changed the URL
          // and broke the frontends that resolve pages by slug.
          ...(slug ? { slug } : {}),
          meta: {
            documents,
            sadrzaj,
            kontakt,
            radno_vrijeme_blagajni,
            lokacija,
            image_groups,
            link,
            footnotes: actionTitle,
            images,
            rental_options: rentalOptions,
            features,
            accordion_items: accordionItems,
            teatar_td_phone: teatarTdPhone,
            teatar_td_email: teatarTdEmail,
            teatar_td_website_url: teatarTdWebsiteUrl,
            teatar_td_address: teatarTdAddress,
            title_en: titleEn,
            excerpt_en: excerptEn,
            content_en: contentEn,
            sadrzaj_en: sadrzajEn,
            kontakt_en: kontaktEn,
            radno_vrijeme_blagajni_en: radnoVrijemeBlagajniEn,
            footnotes_en: actionTitleEn,
            accordion_items_en: accordionItemsEn,
            image_groups_en: imageGroupsEn,
            features_en: featuresEn,
            rental_options_en: rentalOptionsEn,
          },
        }
      );
      return formatPost(response.data);
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno uređeno.");
        return queryClient.invalidateQueries(postsKeys.posts);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje.");
        else toast.error("Greška kod uređivanja.");
      },
    }
  );
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id }) => {
      const response = await axios.delete(
        `${WP_API}/posts/${id}`,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno obrisano.");
        queryClient.invalidateQueries(postsKeys.posts);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje.");
        else toast.error("Greška kod brisanja.");
      },
    }
  );
};
