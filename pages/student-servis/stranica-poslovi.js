import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
} from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  usePost,
  useUpdateCategory,
  useUpdatePost,
} from "../../features/posts";
import {
  jobsObrasciPostId,
  jobsPageId,
  jobTypesCategoryId,
} from "../../lib/constants";
import dynamic from "next/dynamic";
import { usePage, useUpdatePage } from "../../features/page";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const StranicaPage = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories,
  } = useAdminCategories({
    parent: jobTypesCategoryId,
  });

  const {
    data: pageData,
    isLoading: isLoadingPage,
    isError: isPageError,
    refetch: refetchPage,
    isRefetching: isRefetchingPage,
  } = usePage(jobsPageId);

  const {
    data: obrasciPost,
    isLoading: isLoadingObrasciPost,
    isError: isObrasciPostError,
    refetch: refetchObrasciPost,
    isRefetching: isRefetchingObrasciPost,
  } = usePost(jobsObrasciPostId);

  const [pageTitle, setPageTitle] = useState(pageData?.title || "");
  const [pageExcerpt, setPageExcerpt] = useState(pageData?.excerpt || "");

  const [files, setFiles] = useState([]);
  const [obrasciContent, setObrasciContent] = useState(pageData?.excerpt || "");

  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false);
  const [page, setPage] = useState(categories?.[0]?.id || 0);
  const [title, setTitle] = useState("");

  const [dialogTitle, setDialogTitle] = useState("");

  useEffect(() => {
    if (categories) {
      const category = categories.find((c) => c.id === page) || categories[0];
      if (!category) return;
      setPage(category.id);
      setTitle(category.name);
    }
  }, [categories]);

  useEffect(() => {
    if (pageData) {
      setPageTitle(pageData.title.rendered);
      setPageExcerpt(pageData.excerpt.rendered);
    }
  }, [pageData]);

  useEffect(() => {
    if (obrasciPost) {
      setObrasciContent(obrasciPost.content);
      setFiles(obrasciPost.documents || []);
    }
  }, [obrasciPost]);

  const { mutate: updatePost, isLoading: isUpdatingPost } = useUpdatePost();

  const handleSaveObrasciPost = () => {
    updatePost({
      id: jobsObrasciPostId,
      content: obrasciContent,
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType,
          mime_type: file.mimeType,
          source_url: file.src,
        })),
    });
  };

  const handleSelectCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    setPage(categoryId);
    setTitle(category.name);
  };

  const { mutate: updatePage, isLoading: isUpdatingPage } = useUpdatePage();

  const handleSavePage = () => {
    updatePage({
      id: jobsPageId,
      data: {
        title: pageTitle,
        excerpt: pageExcerpt,
      },
    });
  };

  const { mutate: createCategory, isLoading: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isLoading: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isLoading: isDeleting } = useDeleteCategory();

  const handleCreateCategory = () => {
    createCategory(
      {
        name: dialogTitle,
        parent: jobTypesCategoryId,
      },
      {
        onSuccess: (data) => {
          setAddCategoryDialog(null);
          setDialogTitle("");
          setPage(data.id);
        },
      }
    );
  };
  const handleSaveCategory = () => {
    updateCategory({
      id: page,
      name: title,
    });
  };
  const handleDeleteCategory = () => {
    deleteCategory(
      { id: page },
      {
        onSuccess: () => {
          setDeleteCategoryDialog(false);
          setPage(0);
        },
      }
    );
  };

  return (
    <Layout>
      <Header title="Stranica poslovi" />
      <div className="px-5 md:px-10 pb-6">
        <h3 className="text-lg font-semibold mb-3 text-primary">
          Naslov i podnaslov stranice
        </h3>
        {isLoadingPage ? (
          <div className="flex items-center justify-center py-2">
            <CircularProgress size={24} />
          </div>
        ) : isPageError ? (
          <div className="flex flex-col text-error my-2 px-4">
            Greška kod učitavanja
            <LoadingButton
              variant="outlined"
              className="!mt-4 !w-fit"
              onClick={() => refetchPage()}
              loading={isRefetchingPage}
            >
              Pokušaj ponovno
            </LoadingButton>
          </div>
        ) : (
          <>
            <QuillTextEditor
              value={pageTitle}
              onChange={setPageTitle}
              useToolbar={false}
              formats={["bold"]}
              className="obavijest-title font-semibold [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
              placeholder="Unesi naslov..."
            />
            <QuillTextEditor
              value={pageExcerpt}
              onChange={setPageExcerpt}
              containerClassName="mt-4"
              className="[&>div>div]:!min-h-[120px]"
              placeholder="Unesi podnaslov..."
            />
            <LoadingButton
              variant="contained"
              className="!bg-primary !mt-4"
              onClick={handleSavePage}
              loading={isUpdatingPage}
            >
              Spremi
            </LoadingButton>
          </>
        )}

        <h3 className="text-lg font-semibold mb-3 text-primary mt-10">
          Obrasci
        </h3>
        {isLoadingObrasciPost ? (
          <div className="flex items-center justify-center py-2">
            <CircularProgress size={24} />
          </div>
        ) : isObrasciPostError ? (
          <div className="flex flex-col text-error my-2 px-4">
            Greška kod učitavanja
            <LoadingButton
              variant="outlined"
              className="!mt-4 !w-fit"
              onClick={() => refetchObrasciPost()}
              loading={isRefetchingObrasciPost}
            >
              Pokušaj ponovno
            </LoadingButton>
          </div>
        ) : (
          <>
            <QuillTextEditor
              value={obrasciContent}
              onChange={setObrasciContent}
              containerClassName="mt-4"
              className="[&>div>div]:!min-h-[120px]"
              placeholder="Unesi sadržaj..."
              files={files}
              setFiles={setFiles}
            />
            <LoadingButton
              variant="contained"
              className="!bg-primary !mt-4"
              onClick={handleSaveObrasciPost}
              loading={isUpdatingPost}
            >
              Spremi
            </LoadingButton>
          </>
        )}

        <h3 className="text-lg font-semibold mt-10 mb-3 text-primary">
          Vrste poslova
        </h3>
        <div className="flex gap-10 flex-wrap md:flex-nowrap">
          <div>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-2">
                <CircularProgress size={24} />
              </div>
            ) : isCategoriesError ? (
              <div className="flex flex-col text-error my-2 px-4">
                Greška kod učitavanja
                <LoadingButton
                  variant="outlined"
                  className="mt-4"
                  onClick={() => refetchCategories()}
                  loading={isRefetchingCategories}
                >
                  Pokušaj ponovno
                </LoadingButton>
              </div>
            ) : categories.length <= 0 ? (
              <div className="text-gray-500 my-2 px-4">Nema vrsta poslova</div>
            ) : (
              <>
                <Paper className="md:!min-w-[360px] md:!max-w-[500px]">
                  <MenuList>
                    {categories?.map((category) => (
                      <MenuItem
                        key={category.id}
                        selected={page === category.id}
                        onClick={() => handleSelectCategory(category.id)}
                      >
                        <ListItemText className="line-clamp-1">
                          <QuillTextEditor
                            value={category.name}
                            containerClassName="!bg-transparent border-none"
                            className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                            readOnly
                          />
                        </ListItemText>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Paper>
                <LoadingButton
                  className="!mt-2"
                  startIcon={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() => setAddCategoryDialog(true)}
                >
                  Dodaj novu
                </LoadingButton>
              </>
            )}
          </div>
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Naslov
              </h4>
              <QuillTextEditor
                value={title}
                onChange={setTitle}
                useToolbar={false}
                formats={["bold"]}
                className="[&>div>div]:!min-h-fit"
                placeholder="Unesi naslov..."
              />
              <div className="flex !gap-4 !mt-4">
                <LoadingButton
                  variant="contained"
                  className="!bg-primary"
                  onClick={handleSaveCategory}
                  loading={isUpdating}
                >
                  Spremi
                </LoadingButton>
                <LoadingButton
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteCategoryDialog(true)}
                >
                  Obriši
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!addCategoryDialog}
        maxWidth="sm"
        fullWidth
        onClose={() => {
          setAddCategoryDialog(null);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj novu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se dodaje nova vrsta posla. Nakon dodavanja, bit će vidljiva
            na stranici pod filterima poslova.
          </DialogContentText>
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            useToolbar={false}
            containerClassName="mt-2"
            formats={[]}
            className="[&>div>div]:!min-h-fit"
            placeholder="Naslov"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddCategoryDialog(null);
              setDialogTitle("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreateCategory} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteCategoryDialog}
        onClose={() => setDeleteCategoryDialog(false)}
      >
        <DialogTitle>Brisanje vrste posla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše vrsta posla i svi povezani poslovi više neće imati tu
            vrstu posla. Radnja se ne može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteCategoryDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeleteCategory}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default StranicaPage;
